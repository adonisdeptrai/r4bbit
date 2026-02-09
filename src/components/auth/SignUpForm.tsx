import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

    // Password strength check
    const passwordStrength = React.useMemo(() => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

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

        if (passwordStrength < 2) {
            setError("Password is too weak");
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

    const InputWrapper = ({ children, isFocused = false }: { children: React.ReactNode; isFocused?: boolean }) => (
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
                {children}
            </div>
        </div>
    );

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
                        Create Account
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Join the automation revolution
                    </p>
                </motion.div>
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

                {/* Username Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                    <InputWrapper>
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                            placeholder="Choose a username"
                        />
                    </InputWrapper>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                    <InputWrapper>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                            placeholder="name@example.com"
                        />
                    </InputWrapper>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                    <InputWrapper>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-12 pr-14 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </InputWrapper>

                    {/* Password Strength Indicator */}
                    {password && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                        >
                            <div className="flex gap-1.5 mb-1.5">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? getStrengthColor() : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                {passwordStrength <= 1 && 'Weak - add uppercase, numbers, symbols'}
                                {passwordStrength === 2 && 'Fair - add more variety'}
                                {passwordStrength === 3 && 'Good - almost there'}
                                {passwordStrength === 4 && (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Strong password
                                    </span>
                                )}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                    <InputWrapper>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300" size={18} />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-12 pr-14 py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </InputWrapper>

                    {/* Password match indicator */}
                    {confirmPassword && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-xs ml-1 flex items-center gap-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                                }`}
                        >
                            {password === confirmPassword ? (
                                <><CheckCircle2 size={12} /> Passwords match</>
                            ) : (
                                <><AlertCircle size={12} /> Passwords don't match</>
                            )}
                        </motion.p>
                    )}
                </div>

                {/* Submit Button - Premium Gradient */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="pt-2"
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
                            <span className="relative z-10 text-base">Create Account</span>
                        )}
                    </Button>
                </motion.div>

                {/* Mobile Toggle */}
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
