import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { Button, cn } from '../components/common';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { API_ENDPOINTS } from '../config/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get token from URL
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        // Validation
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setStatus('loading');

        try {
            const res = await fetch(API_ENDPOINTS.AUTH_RESET_PASSWORD(token!), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, confirmPassword })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Password reset successful!');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/auth');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Reset Password Error:', err);
            setStatus('error');
            setMessage('Server error. Please try again later.');
        }

        setIsLoading(false);
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
                <div className="relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-[32px] border border-white/10 p-10 shadow-2xl shadow-black/50 overflow-hidden group">
                    {/* Ambient Glow */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-cyan/10 rounded-full blur-[80px] group-hover:bg-brand-cyan/15 transition-all duration-1000"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/15 transition-all duration-1000"></div>

                    <div className="relative z-10">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-cyan/20 to-blue-500/20 border border-brand-cyan/30 mb-6 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]">
                            <Shield size={32} className="text-brand-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold mb-3 tracking-tight">
                            {status === 'success' ? 'Password Reset!' : 'Reset Password'}
                        </h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            {status === 'success'
                                ? 'Your password has been changed successfully.'
                                : 'Enter your new password below.'}
                        </p>

                        {status === 'idle' && token ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Error Message */}
                                {message && status !== 'success' && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                                        <XCircle size={14} className="shrink-0" /> {message}
                                    </div>
                                )}

                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                                            placeholder="Enter new password"
                                            required
                                            minLength={6}
                                            autoFocus
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

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200"
                                            placeholder="Confirm new password"
                                            required
                                            minLength={6}
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

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all mt-6 border-none"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>
                            </form>
                        ) : status === 'loading' ? (
                            <div className="text-center py-8">
                                <Loader2 size={40} className="text-brand-cyan animate-spin mx-auto mb-4" />
                                <p className="text-slate-400">Resetting your password...</p>
                            </div>
                        ) : status === 'success' ? (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-gradient-to-tr from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                                >
                                    <CheckCircle size={40} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </motion.div>
                                <p className="text-slate-400 mb-6">{message}</p>
                                <p className="text-sm text-slate-500">Redirecting to login...</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <XCircle size={40} className="text-red-400 mx-auto mb-4" />
                                <p className="text-slate-400 mb-6">{message}</p>
                                <Button
                                    onClick={() => navigate('/auth')}
                                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
