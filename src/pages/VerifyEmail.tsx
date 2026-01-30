import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Check, Mail, Loader2, AlertCircle, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { Button } from '../components/common';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'waiting' | 'success' | 'error' | 'verifying'>('waiting');
    const [message, setMessage] = useState('We are waiting for your email confirmation.');
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        // Listen for auth state changes (if user confirms in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                setStatus('success');
                setMessage('Your email has been verified! Redirecting to shop...');
                setTimeout(() => navigate('/shop'), 2000);
            }
        });

        // Check if already verified on mount
        const checkCurrentStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email_confirmed_at) {
                setStatus('success');
                setMessage('Your email is already verified. Redirecting...');
                setTimeout(() => navigate('/shop'), 1500);
            }
        };

        checkCurrentStatus();

        return () => subscription.unsubscribe();
    }, [navigate]);

    const resendVerificationEmail = async () => {
        if (!email) {
            setMessage('Email address not found. Please try to login again.');
            return;
        }

        setResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) throw error;

            setMessage('Verification email resent! Please check your inbox.');
        } catch (err: any) {
            console.error('Resend error:', err);
            setMessage(err.message || 'Failed to resend email');
        }
        setResending(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-[#020617] text-white selection:bg-brand-cyan/30">
            <AnimatedBackground />

            {/* Back Button */}
            <button
                onClick={() => navigate('/auth')}
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-all backdrop-blur-sm z-20"
            >
                <ArrowLeft size={16} /> <span>Back to Login</span>
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] mx-4 relative z-10"
            >
                <div className="relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-[32px] border border-white/5 p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden text-center">

                    {/* Inner lighting effects */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[32px]"></div>

                    {/* Icon Status Area */}
                    <div className="relative mb-8 flex justify-center">
                        <AnimatePresence mode="wait">
                            {status === 'waiting' && (
                                <motion.div
                                    key="waiting"
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 20 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-cyan/20 to-blue-500/20 text-brand-cyan flex items-center justify-center ring-1 ring-brand-cyan/50 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
                                >
                                    <Mail size={40} className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                </motion.div>
                            )}
                            {status === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 20 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-green-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                                >
                                    <Check size={40} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Particle effects for waiting */}
                        {status === 'waiting' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="absolute w-24 h-24 rounded-full border border-brand-cyan/30 animate-ping opacity-20"></span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-3">
                        {status === 'waiting' ? 'Check Your Inbox' : 'Verified!'}
                    </h1>

                    <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[300px] mx-auto">
                        {message}
                    </p>

                    {email && status === 'waiting' && (
                        <div className="mb-8 p-4 bg-white/5 border border-white/5 rounded-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">Verification Link Sent To</p>
                            <p className="text-brand-cyan font-medium truncate">{email}</p>
                        </div>
                    )}

                    <div className="space-y-4 relative z-10">
                        {status === 'waiting' && (
                            <Button
                                onClick={resendVerificationEmail}
                                disabled={resending}
                                className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all border-none"
                            >
                                {resending ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </Button>
                        )}

                        {status === 'success' && (
                            <Button
                                onClick={() => navigate('/shop')}
                                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all border-none"
                            >
                                Proceed to Shop <ArrowRight size={18} className="ml-2" />
                            </Button>
                        )}

                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full py-3 text-slate-500 hover:text-white text-sm font-medium transition-colors"
                        >
                            Return to Login
                        </button>
                    </div>

                    {/* Liquid Footer Hint */}
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <Sparkles size={12} className="text-brand-cyan" />
                            <span>Powered by Supabase Security</span>
                        </div>
                    </div>
                </div>

                {/* Bottom decorative elements */}
                <div className="mt-8 text-center flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="h-4 w-1 bg-brand-cyan rounded-full"></div>
                    <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                    <div className="h-4 w-1 bg-brand-cyan rounded-full"></div>
                </div>
            </motion.div>
        </div>
    );
}
