import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { ViewState } from '../types';

interface AuthCallbackProps {
    onNavigate: (view: ViewState) => void;
}

export default function AuthCallback({ onNavigate }: AuthCallbackProps) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get session from URL hash after OAuth redirect
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    throw new Error('Failed to get session from Supabase');
                }

                // Send session to backend for user sync
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/auth/google/callback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Authentication failed');
                }

                // Save JWT token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setStatus('success');
                setMessage('Login successful! Redirecting...');

                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/'; // Force reload to update auth context
                }, 1500);
            } catch (err: any) {
                console.error('Callback error:', err);
                setStatus('error');
                setMessage(err.message || 'Authentication failed');

                // Redirect to auth page after 3 seconds
                setTimeout(() => {
                    onNavigate('auth');
                }, 3000);
            }
        };

        handleCallback();
    }, [onNavigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <div className="mb-6">
                    {status === 'loading' && (
                        <Loader2 className="w-16 h-16 mx-auto text-brand-cyan animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="w-16 h-16 mx-auto text-emerald-400" />
                    )}
                    {status === 'error' && (
                        <XCircle className="w-16 h-16 mx-auto text-red-400" />
                    )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                    {status === 'loading' && 'Authenticating...'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Error'}
                </h2>
                <p className="text-slate-400">{message}</p>
            </motion.div>
        </div>
    );
}
