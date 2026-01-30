import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { ViewState } from '../types';
import { useNavigate } from 'react-router-dom';

interface AuthCallbackProps {
    onNavigate: (view: ViewState) => void;
}

export default function AuthCallback({ onNavigate }: AuthCallbackProps) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase automatically detects session from URL hash
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    throw new Error('Failed to authenticate');
                }

                // Check if user exists in public.users table
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                // If user doesn't exist (OAuth first-time user), create record
                if (!existingUser && session.user.email) {
                    const username = session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.username ||
                        session.user.email.split('@')[0];

                    await supabase
                        .from('users')
                        .insert([{
                            id: session.user.id,
                            username,
                            email: session.user.email,
                            role: 'user',
                            balance: 0,
                            is_verified: true, // OAuth users are auto-verified
                            google_id: session.user.id
                        }]);
                }

                setStatus('success');
                setMessage('Login successful! Redirecting...');

                // Redirect to shop after 1 second
                setTimeout(() => {
                    navigate('/shop');
                }, 1000);
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
    }, [onNavigate, navigate]);

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
