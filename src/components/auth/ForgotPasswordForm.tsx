import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../common';
import { supabase } from '../../config/supabase';

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.includes('@')) {
            setError("Invalid email address");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (!error) {
                setSuccess("If an account exists with this email, you will receive a password reset link.");
            } else {
                setError(error.message || 'Failed to send reset email');
            }
        } catch (err: any) {
            setError(err.message || 'Server connection failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 relative z-10">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8"
            >
                <ArrowLeft size={16} /> Back to Login
            </button>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-slate-400 text-sm">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
                        >
                            <AlertCircle size={14} className="shrink-0" /> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
                        >
                            <CheckCircle size={14} className="shrink-0" /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading || !!success}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17]/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                {!success && (
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all mt-4 border-none"
                    >
                        {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                    </Button>
                )}
            </form>
        </div>
    );
};
