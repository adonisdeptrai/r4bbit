import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button, cn } from '../components/common';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { ViewState } from '../types';

interface VerifyEmailProps {
    onNavigate?: (view: ViewState) => void;
}

export default function VerifyEmail({ onNavigate }: VerifyEmailProps) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    // Use native URLSearchParams since we interpret routing manually
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (err) {
                console.error('Verification Error:', err);
                setStatus('error');
                setMessage('Server error. Please try again later.');
            }
        };

        verify();
    }, [token]);

    const handleLoginRedirect = () => {
        if (onNavigate) {
            onNavigate('auth');
        } else {
            // Fallback if prop not passed
            window.location.href = '/auth';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-white selection:bg-brand-cyan/30">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md mx-4 relative z-10"
            >
                <div className="relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-[32px] border border-white/10 p-10 text-center shadow-2xl shadow-black/50 overflow-hidden group">

                    {/* Ambient Glow */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-cyan/10 rounded-full blur-[80px] group-hover:bg-brand-cyan/15 transition-all duration-1000"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/15 transition-all duration-1000"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {status === 'loading' && (
                            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/20 to-transparent opacity-50 animate-pulse"></div>
                                <Loader2 size={40} className="text-brand-cyan animate-spin drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            </div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                type="spring"
                                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                            >
                                <CheckCircle size={40} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ scale: 0, rotate: 45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                type="spring"
                                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]"
                            >
                                <XCircle size={40} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            </motion.div>
                        )}

                        <h2 className="text-3xl font-bold mb-3 tracking-tight">
                            {status === 'loading' && 'Verifying...'}
                            {status === 'success' && 'Verified!'}
                            {status === 'error' && 'Verification Failed'}
                        </h2>

                        <p className="text-slate-400 mb-10 leading-relaxed">
                            {message}
                        </p>

                        <Button
                            onClick={handleLoginRedirect}
                            className={cn(
                                "w-full h-12 rounded-xl border transition-all duration-300 font-semibold shadow-lg",
                                status === 'success'
                                    ? "bg-gradient-to-r from-brand-cyan to-blue-600 border-transparent hover:shadow-brand-cyan/25 text-white"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20"
                            )}
                        >
                            {status === 'success' ? 'Continue to Login' : 'Return to Login'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
