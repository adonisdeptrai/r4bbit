import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpFormProps {
    onToggleMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-slate-400 text-sm">Join the automation revolution</p>
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
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17]/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                            placeholder="Username"
                        />
                    </div>
                </div>

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

                <div className="space-y-1.5">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17]/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                            placeholder="Confirm Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all mt-4 border-none"
                >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                </Button>

                <div className="mt-8 text-center md:hidden">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-brand-cyan font-bold hover:text-white transition-colors ml-1"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};
