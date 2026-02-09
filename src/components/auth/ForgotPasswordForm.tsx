import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle, Send } from 'lucide-react';
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto p-8 md:p-10 relative z-10"
        >
            {/* Back Button */}
            <motion.button
                onClick={onBack}
                whileHover={{ x: -3 }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:text-brand-cyan transition-colors" />
                <span>Back to Login</span>
            </motion.button>

            {/* Icon Header */}
            <div className="flex justify-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                        border: '1px solid rgba(34,211,238,0.3)',
                        boxShadow: '0 10px 40px -10px rgba(34,211,238,0.3)'
                    }}
                >
                    {success ? (
                        <CheckCircle size={36} className="text-emerald-400" />
                    ) : (
                        <Mail size={36} className="text-brand-cyan" />
                    )}
                </motion.div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                    {success ? 'Check Your Email' : 'Reset Password'}
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-xs mx-auto">
                    {success
                        ? 'We sent you a reset link'
                        : 'Enter your email and we\'ll send you a reset link'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Messages */}
                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="relative overflow-hidden rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="px-4 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle size={16} className="text-red-400" />
                                </div>
                                <span className="text-red-200 text-sm font-medium">{error}</span>
                            </div>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="relative overflow-hidden rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="px-4 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <CheckCircle size={16} className="text-emerald-400" />
                                </div>
                                <span className="text-emerald-200 text-sm font-medium">{success}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email Input - Liquid Glass Style */}
                {!success && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-cyan/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />
                            <div
                                className="relative rounded-xl overflow-hidden transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                                }}
                            >
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button or Back to Login */}
                {!success ? (
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="pt-2"
                    >
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 relative overflow-hidden rounded-xl font-bold text-white transition-all border-none flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%)',
                                boxShadow: '0 10px 40px -10px rgba(34,211,238,0.5), 0 4px 20px -5px rgba(59,130,246,0.4)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} className="relative z-10" />
                                    <span className="relative z-10 text-base">Send Reset Link</span>
                                </>
                            )}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2"
                    >
                        <Button
                            type="button"
                            onClick={onBack}
                            className="w-full h-14 relative overflow-hidden rounded-xl font-bold text-white transition-all"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}
                        >
                            <span className="relative z-10 text-base">Return to Login</span>
                        </Button>
                    </motion.div>
                )}
            </form>
        </motion.div>
    );
};
