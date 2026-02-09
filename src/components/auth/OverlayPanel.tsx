import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { Button } from '../common';

interface OverlayPanelProps {
    isSignUp: boolean;
    onToggle: (isSignUp: boolean) => void;
}

export const OverlayPanel: React.FC<OverlayPanelProps> = ({ isSignUp, onToggle }) => {
    return (
        <div
            className="absolute top-0 right-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 hidden md:block"
            style={{ transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)' }}
        >
            <div className="relative h-full w-full overflow-hidden">
                {/* Glass Background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15,20,32,0.9) 0%, rgba(15,20,32,0.7) 100%)',
                        backdropFilter: 'blur(40px)',
                        borderLeft: '1px solid rgba(255,255,255,0.08)'
                    }}
                />

                {/* Animated Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)',
                            filter: 'blur(60px)'
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -20, 0],
                            y: [0, 30, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                            filter: 'blur(50px)'
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, 15, 0],
                            y: [0, 15, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
                            filter: 'blur(40px)'
                        }}
                    />
                </div>

                {/* Noise Texture */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"
                    }}
                />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-12 text-center z-10">
                    <motion.div
                        key={isSignUp ? "signup-overlay" : "signin-overlay"}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        {/* Icon */}
                        <motion.div
                            className="flex justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                                    border: '1px solid rgba(34,211,238,0.3)',
                                    boxShadow: '0 10px 40px -10px rgba(34,211,238,0.3)'
                                }}
                            >
                                {isSignUp ? (
                                    <Zap size={28} className="text-brand-cyan" />
                                ) : (
                                    <Sparkles size={28} className="text-brand-cyan" />
                                )}
                            </div>
                        </motion.div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                {isSignUp ? "One of Us?" : "New Here?"}
                            </h2>
                            <p className="text-slate-300 max-w-[280px] mx-auto leading-relaxed text-base">
                                {isSignUp
                                    ? "If you already have an account, just sign in. We've missed you!"
                                    : "Join the revolution and start building your automated empire today."}
                            </p>
                        </div>

                        {/* CTA Button - Liquid Glass */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={() => onToggle(!isSignUp)}
                                className="relative overflow-hidden px-10 py-4 rounded-xl font-bold text-white transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                                }}
                            >
                                <span className="relative z-10 text-base">
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </span>
                                <div
                                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(59,130,246,0.2) 100%)'
                                    }}
                                />
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom Light Reflection */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, rgba(34,211,238,0.05) 0%, transparent 100%)'
                    }}
                />
            </div>
        </div>
    );
};
