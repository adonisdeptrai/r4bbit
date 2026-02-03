import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { OverlayPanel } from '../components/auth/OverlayPanel';

interface AuthProps {
    onNavigate: (view: ViewState) => void;
}

export default function Auth({ onNavigate }: AuthProps) {
    const { isAuthenticated } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgot, setIsForgot] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            onNavigate('shop');
        }
    }, [isAuthenticated, onNavigate]);

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

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full ${isForgot ? 'max-w-md' : 'max-w-[420px] md:max-w-[1000px]'} mx-4 relative z-10 transition-all duration-500`}
            >
                {/* Glass Card */}
                <div className={`relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-[32px] border border-white/5 shadow-2xl shadow-black/50 overflow-hidden min-h-[600px] flex`}>

                    {/* Inner lighting effects */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[32px]"></div>

                    {/* Forgot Password Mode */}
                    <AnimatePresence mode='wait'>
                        {isForgot && (
                            <motion.div
                                className="w-full h-full absolute inset-0 bg-[#0F1420]/80 z-50 flex items-center justify-center backdrop-blur-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <ForgotPasswordForm onBack={() => setIsForgot(false)} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sliding Layout - Hidden on Mobile */}
                    <div className="hidden md:flex w-full h-full relative">
                        {/* Sign In Container (Left) */}
                        <div className={`w-1/2 h-full flex items-center justify-center transition-all duration-700 ${isSignUp ? 'opacity-0 pointer-events-none translate-x-full' : 'opacity-100 translate-x-0'}`}>
                            <SignInForm
                                onForgotPassword={() => setIsForgot(true)}
                                onToggleMode={() => setIsSignUp(true)}
                            />
                        </div>

                        {/* Sign Up Container (Right) */}
                        <div className={`w-1/2 h-full flex items-center justify-center transition-all duration-700 absolute right-0 top-0 h-full ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-full'}`}>
                            <SignUpForm
                                onToggleMode={() => setIsSignUp(false)}
                            />
                        </div>

                        {/* Overlay Panel (The Moving Part) */}
                        <OverlayPanel isSignUp={isSignUp} onToggle={setIsSignUp} />
                    </div>

                    {/* Mobile Layout - Switcher */}
                    <div className="md:hidden w-full flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                            {!isForgot && (
                                !isSignUp ? (
                                    <motion.div
                                        key="signin"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="w-full"
                                    >
                                        <SignInForm
                                            onForgotPassword={() => setIsForgot(true)}
                                            onToggleMode={() => setIsSignUp(true)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full"
                                    >
                                        <SignUpForm
                                            onToggleMode={() => setIsSignUp(false)}
                                        />
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}