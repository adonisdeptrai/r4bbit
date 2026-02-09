import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, Chrome, Eye, EyeOff } from 'lucide-react';
import { Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';

interface SignInFormProps {
    onForgotPassword: () => void;
    onToggleMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword, onToggleMode }) => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("All fields are required");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 md:p-10 relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Sign in to continue your journey
                    </p>
                </motion.div>
            </div>

            {/* Google Auth - Liquid Glass Button */}
            <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 relative overflow-hidden rounded-2xl flex items-center justify-center gap-3 transition-all font-medium text-sm text-white group mb-6"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 0.8s ease' }} />
                <Chrome size={20} className="text-white/80 group-hover:text-white transition-colors" />
                <span className="font-semibold">Continue with Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-4 text-slate-500 bg-transparent backdrop-blur-sm">
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
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
                </AnimatePresence>

                {/* Email Input - Liquid Glass Style */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
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

                {/* Password Input - Liquid Glass Style */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
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
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-12 pr-14 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-brand-cyan hover:text-cyan-300 transition-colors font-medium hover:underline underline-offset-2"
                    >
                        Forgot Password?
                    </button>
                </div>

                {/* Submit Button - Premium Gradient */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 relative overflow-hidden rounded-xl font-bold text-white transition-all border-none"
                        style={{
                            background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%)',
                            boxShadow: '0 10px 40px -10px rgba(34,211,238,0.5), 0 4px 20px -5px rgba(59,130,246,0.4)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="relative z-10 text-base">Sign In</span>
                        )}
                    </Button>
                </motion.div>

                {/* Mobile Toggle */}
                <div className="mt-8 text-center md:hidden">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-brand-cyan font-bold hover:text-white transition-colors ml-1"
                        >
                            Sign up for free
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};
