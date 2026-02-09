import React from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';
import { ViewState } from '../types';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';

interface OrderSuccessProps {
    onNavigate: (view: ViewState) => void;
}

import { useLocation, Navigate } from 'react-router-dom';

interface OrderState {
    orderId: string;
    date: string;
    totalPaid: string;
    paymentMethod: string;
}

export default function OrderSuccess({ onNavigate }: OrderSuccessProps) {
    const location = useLocation();
    const state = location.state as OrderState;

    if (!state) {
        return <Navigate to="/shop" replace />;
    }

    const { orderId, date, paymentMethod, totalPaid } = state;

    return (
        <div className="min-h-screen bg-[#020617] font-sans relative overflow-hidden flex items-center justify-center p-4">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className="bg-[#0b1121]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full p-8 relative z-10"
            >
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-brand-cyan/10 rounded-full flex items-center justify-center ring-1 ring-brand-cyan/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                    >
                        <Check size={48} className="text-brand-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" strokeWidth={3} />
                    </motion.div>
                </div>

                {/* Headings */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Payment Successful!</h1>
                    <p className="text-slate-400 text-sm font-medium">Your automated future awaits.</p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 relative overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order Ref</span>
                            <span className="text-white font-mono font-bold tracking-wide">{orderId}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date</span>
                            <span className="text-white font-medium">{date}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Method</span>
                            <span className="text-white font-bold flex items-center gap-2">
                                <span className="p-1 bg-white/10 rounded text-[10px]">🏛️</span> {paymentMethod}
                            </span>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total Paid</span>
                            <span className="text-brand-cyan font-bold text-xl drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">{totalPaid}</span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => onNavigate('dashboard')}
                        className="w-full bg-brand-cyan hover:bg-[#5ff5ff] text-black font-bold h-14 rounded-xl text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                        Access My Library <ArrowRight size={16} />
                    </Button>
                    <Button
                        onClick={() => onNavigate('shop')}
                        className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold h-14 rounded-xl text-sm transition-all"
                    >
                        Return to Home
                    </Button>
                </div>
            </motion.div>

            {/* Chat Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="fixed bottom-8 right-8 w-14 h-14 bg-[#0b1121] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-110 hover:border-brand-cyan/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all z-50 text-white group"
            >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020617] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <MessageCircle size={24} className="group-hover:text-brand-cyan transition-colors" />
            </motion.button>
        </div>
    );
}
