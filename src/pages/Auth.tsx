import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowLeft, Mail, AlertCircle, Chrome, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button, cn } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';

interface AuthProps {
    onNavigate: (view: ViewState) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function Auth({ onNavigate }: AuthProps) {
    const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Missing State Variables
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            onNavigate('shop');
        }
    }, [isAuthenticated, onNavigate]);

    useEffect(() => {
        setError(null);
        setSuccess(null);
        setResetSent(false);
        setIsVerifying(false);
        setVerificationCode('');
    }, [mode]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess("Account verified! Logging in...");
                await new Promise(resolve => setTimeout(resolve, 1500));
                // Automatically login after verification
                await login(username, password);
            } else {
                setError(data.message || "Verification failed");
            }
        } catch (err) {
            setError("Server connection failed");
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (mode === 'forgot') {
            if (!email.includes('@')) {
                setError("Invalid email address");
                return;
            }

            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();

                if (res.ok) {
                    setResetSent(true);
                    setSuccess(data.message);
                } else {
                    setError(data.message || 'Failed to send reset email');
                }
            } catch (err) {
                setError('Server connection failed');
            }
            setIsLoading(false);
            return;
        }

        if (!username || !password) {
            setError("All fields are required");
            return;
        }

        if (mode === 'register' && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (mode === 'login') {
                await login(email, password); // Supabase requires email
            } else if (mode === 'register') {
                await register(username, email, password);
                setIsVerifying(true);
                setSuccess('Registration successful! Please check your email to verify your account.');
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-[#020617] text-white selection:bg-brand-cyan/30">
            <AnimatedBackground />

            {/* Back Button */}
            <button
                onClick={() => onNavigate('landing')}
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-all backdrop-blur-sm z-20"
            >
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
            </button>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] mx-4 relative z-10"
            >
                {/* Glass Container */}
                <div className="relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-[32px] border border-white/5 p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden">

                    {/* Inner lighting effects */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[32px]"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/20 mb-6">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            {isVerifying ? 'Verify Account' : (
                                mode === 'login' ? 'Welcome Back' :
                                    mode === 'register' ? 'Join the Revolution' : 'Reset Password'
                            )}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {isVerifying ? `Enter the code sent to ${email}` : (
                                mode === 'login' ? 'Enter your credentials to access your dashboard.' :
                                    mode === 'register' ? 'Start building your automated empire today.' :
                                        'Enter your email to receive a reset link.'
                            )}
                        </p>
                    </div>

                    {/* Google Auth Button */}
                    {mode !== 'forgot' && !isVerifying && (
                        <div className="mb-6 relative z-10">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await loginWithGoogle();
                                    } catch (err: any) {
                                        setError(err.message || 'Google login failed');
                                    }
                                }}
                                disabled={isLoading}
                                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-sm text-slate-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Chrome size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                                <span>Sign in with Google</span>
                            </button>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0F1420]/80 px-2 text-slate-500 rounded">Or continue with</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!resetSent && !isVerifying ? (
                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
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

                            {mode === 'forgot' || mode === 'register' ? (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            autoFocus={mode === 'forgot'}
                                            disabled={isLoading}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {mode !== 'forgot' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">
                                            {mode === 'login' ? 'Email' : 'Username'}
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                            <input
                                                type={mode === 'login' ? 'email' : 'text'}
                                                value={mode === 'login' ? email : username}
                                                autoFocus
                                                disabled={isLoading}
                                                onChange={(e) => mode === 'login' ? setEmail(e.target.value) : setUsername(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder={mode === 'login' ? 'your@email.com' : 'Enter username'}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-slate-400">Password</label>
                                            {mode === 'login' && (
                                                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-cyan hover:text-cyan-300 transition-colors">Forgot?</button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                disabled={isLoading}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    {mode === 'register' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    disabled={isLoading}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-11 pr-12 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Re-enter password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all mt-6 border-none"
                            >
                                {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                    mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    ) : isVerifying ? (
                        <form onSubmit={handleVerify} className="space-y-4 relative z-10">
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
                                <label className="text-xs font-bold text-slate-400 ml-1">Verification Code</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors font-mono tracking-widest text-lg">#</div>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#0a0e17] border border-white/5 rounded-xl text-lg tracking-[0.5em] font-mono text-center focus:outline-none focus:border-brand-cyan/50 focus:bg-[#0a0e17] transition-all placeholder:text-slate-700 text-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 6}
                                className="w-full h-12 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-brand-cyan/20 transition-all mt-6 border-none"
                            >
                                {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                            </Button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Cancel & Return to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-gradient-to-tr from-brand-cyan/20 to-blue-500/20 text-brand-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-brand-cyan/50 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
                            >
                                <Mail size={36} className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            </motion.div>
                            <h3 className="font-bold text-white mb-2 text-2xl tracking-tight">Check your inbox</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
                                We've sent a link to <span className="text-brand-cyan font-semibold">{email}</span>.
                                <br />Please check your inbox to continue.
                            </p>
                            <Button
                                onClick={() => setMode('login')}
                                className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl hover:border-brand-cyan/30 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.15)] transition-all duration-300"
                            >
                                Back to Login
                            </Button>
                        </div>
                    )}

                    {/* Footer Toggle */}
                    {!resetSent && (
                        <div className="mt-8 text-center relative z-10 pt-6 border-t border-white/5">
                            <p className="text-sm text-slate-500">
                                {mode === 'login' ? "Don't have an account? " : mode === 'register' ? "Already have an account? " : ""}
                                {mode !== 'forgot' && (
                                    <button
                                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                        className="text-brand-cyan font-bold hover:text-white transition-colors ml-1"
                                    >
                                        {mode === 'login' ? 'Sign up for free' : 'Sign in'}
                                    </button>
                                )}
                                {mode === 'forgot' && (
                                    <button onClick={() => setMode('login')} className="text-slate-400 hover:text-white font-medium flex items-center justify-center gap-1 mx-auto transition-colors">
                                        <ArrowLeft size={14} /> Back to Login
                                    </button>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Social Proof */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 font-medium mb-3">Join over <span className="text-slate-300">2,000+</span> global automation experts</p>
                    <div className="flex justify-center -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] text-white overflow-hidden relative z-[${10 - i}]`}>
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div >
        </div >
    );
}