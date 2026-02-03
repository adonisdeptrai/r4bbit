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
        <div className="w-full max-w-md mx-auto p-8 relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-slate-400 text-sm">Sign in to continue your journey</p>
            </div>

            {/* Google Auth */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-sm text-slate-200 group mb-6"
            >
                <Chrome size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                <span>Sign in with Google</span>
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0F1420] px-2 text-slate-500 rounded">Or use email</span>
                </div>
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
                </AnimatePresence>

                <div className="space-y-1.5">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17]/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                            placeholder="Email Address"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17]/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs text-brand-cyan hover:text-cyan-300 transition-colors font-medium"
                    >
                        Forgot Password?
                    </button>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all border-none"
                >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                </Button>

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
