import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { GlassInput, AlertMessage, GradientButton } from './AuthUI';

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
                <AlertMessage message={error} variant="error" />
                <AlertMessage message={success} variant="success" />

                {/* Email Input */}
                {!success && (
                    <GlassInput
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="name@example.com"
                        disabled={isLoading}
                    />
                )}

                {/* Submit Button or Back to Login */}
                <div className="pt-2">
                    {!success ? (
                        <GradientButton type="submit" isLoading={isLoading}>
                            <Send size={18} />
                            Send Reset Link
                        </GradientButton>
                    ) : (
                        <GradientButton type="button" onClick={onBack} variant="glass">
                            Return to Login
                        </GradientButton>
                    )}
                </div>
            </form>
        </motion.div>
    );
};
