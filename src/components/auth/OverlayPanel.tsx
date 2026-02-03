import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common';

interface OverlayPanelProps {
    isSignUp: boolean;
    onToggle: (isSignUp: boolean) => void;
}

export const OverlayPanel: React.FC<OverlayPanelProps> = ({ isSignUp, onToggle }) => {
    return (
        <div className="absolute top-0 right-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-50 hidden md:block"
            style={{ transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)' }}>

            <div className="relative h-full w-full bg-[#0F1420]/60 backdrop-blur-2xl border-l border-white/5 text-white">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 via-blue-900/40 to-[#020617] opacity-80" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-cyan/30 rounded-full blur-[80px]" />
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative h-full flex flex-col items-center justify-center p-12 text-center z-10">
                    <motion.div
                        key={isSignUp ? "signup-overlay" : "signin-overlay"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isSignUp ? "One of Us?" : "New Here?"}
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-[280px] mx-auto leading-relaxed">
                            {isSignUp
                                ? "If you already have an account, just sign in. We've missed you!"
                                : "Join the revolution and start building your automated empire today."}
                        </p>

                        <Button
                            onClick={() => onToggle(!isSignUp)}
                            className="bg-transparent border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-[#020617] transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)]"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
