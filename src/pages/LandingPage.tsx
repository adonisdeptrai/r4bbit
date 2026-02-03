import React, { useState, useEffect } from 'react';
import {
    Menu, X, Play, Code, ShoppingBag, Globe, Zap, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, cn, LiquidCard } from '../components/common';
import { ViewState } from '../types';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { HeroTerminal } from '../components/landing/HeroTerminal';
import { PartnersTicker } from '../components/landing/PartnersTicker';

// Lazy load heavy below-the-fold components
const WorkflowEditor = React.lazy(() => import('../components/dashboard/WorkflowEditor').then(module => ({ default: module.WorkflowEditor })));
// Features was defined inline, I should extract it or just keep it if it's small, but plan said lazy load Features.
// Wait, Features IS defined inline in this file (lines 185-284). I cannot lazy load it easily unless I move it to a file.
// The user said "optimize performance". Moving it to a file is "Clean Architecture".
// I will extract it to components/Features.tsx first? No, that's too many steps for one tool call.
// I'll stick to lazy loading what is ALREADY imported: WorkflowEditor and RecentOrders.
// Features is inline, so I will just optimize imports.
// Wait, I see `import { WorkflowEditor }` on line 11.
// And `import { RecentOrders }` on line 12.

const RecentOrders = React.lazy(() => import('../components/dashboard/RecentOrders').then(module => ({ default: module.RecentOrders })));

import { AdminDashboard } from './AdminDashboard';
import { Footer } from '../components/layout/Footer';

// --- Shared Components for New Design ---

const Logo = ({ className }: { className?: string }) => (
    <div className={cn(
        "relative w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20",
        className
    )}>
        <Code size={18} className="relative z-10" />
    </div>
);

// --- Floating Pill Navbar ---
const Navbar = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
            >
                <div className="rounded-full pl-6 pr-2 py-2 flex items-center gap-8 pointer-events-auto max-w-2xl w-full justify-between shadow-2xl shadow-brand-cyan/5 border border-white/5 backdrop-blur-2xl bg-[#0F1420]/60">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('R4B_SCROLL_TO', { detail: 'top' }))}>
                        <Logo />
                        <span className="font-bold text-lg tracking-tight text-white">R4B</span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {['Builder', 'Features', 'Community'].map((item) => (
                            <button
                                key={item}
                                onClick={() => window.dispatchEvent(new CustomEvent('R4B_SCROLL_TO', { detail: item.toLowerCase() }))}
                                className="text-xs font-medium text-slate-400 hover:text-white transition-colors hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] bg-transparent border-none cursor-pointer"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate('shop')}
                            className="hidden md:flex px-4 py-2 text-xs font-bold text-white hover:text-brand-cyan transition-colors"
                        >
                            Marketplace
                        </button>
                        <Button
                            size="sm"

                            onClick={() => onNavigate('shop')}
                            className="rounded-full px-5 h-9 bg-white text-black hover:bg-slate-200 border-none font-bold text-xs shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all"
                        >
                            Get Started
                        </Button>

                        <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-20 left-4 right-4 z-40 glass-panel rounded-3xl p-6 md:hidden flex flex-col gap-4 border border-white/10 shadow-2xl bg-[#020617]/90"
                    >
                        {['Builder', 'Features', 'Community'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setMenuOpen(false);
                                    window.dispatchEvent(new CustomEvent('R4B_SCROLL_TO', { detail: item.toLowerCase() }));
                                }}
                                className="text-lg font-medium text-slate-200 py-2 border-b border-white/5 text-left bg-transparent"
                            >
                                {item}
                            </button>
                        ))}
                        <Button onClick={() => { onNavigate('shop'); setMenuOpen(false); }} className="w-full justify-center bg-brand-cyan text-black mt-2 font-bold">
                            Open Marketplace
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// --- Hero Section ---
const Hero = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => {
    return (
        <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 z-10">

            <div className="text-center lg:text-left max-w-2xl lg:max-w-xl z-20 flex-shrink-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
                >
                    <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                    />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">R4B v3.0 Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                >
                    <span className="text-gradient">Automate.</span><br />
                    <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Dominate. </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">Scale.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed"
                >
                    Stop trading time for money. R4B provides the enterprise-grade scripts,
                    proxies, and tools you need to build a passive MMO empire.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
                >
                    <Button size="lg" onClick={() => onNavigate('shop')} className="w-full sm:w-auto px-8 h-12 rounded-full bg-white text-black hover:bg-slate-200 border-none font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow">
                        Get Started for Free
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 rounded-full border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-bold text-sm backdrop-blur-sm">
                        <Play size={14} className="mr-2 fill-current" /> Watch Demo
                    </Button>
                </motion.div>
            </div>

            {/* --- Hero Visual: Functional Dashboard/Terminal --- */}
            <div className="w-full lg:flex-1 max-w-2xl lg:max-w-none flex justify-center lg:justify-end">
                <HeroTerminal />
            </div>
        </section>
    );
};

// --- Features Section: 2x2 Widget Grid on Mobile, 4-Col Panorama on Desktop ---
import { Cpu, ShieldCheck, Activity } from 'lucide-react';

const Features = () => {
    return (
        <section id="features" className="py-24 md:py-32 relative overflow-hidden z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex flex-col justify-center">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        <span className="text-white">Why </span>
                        <span className="text-slate-500">Choose Us.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">

                    {/* Card 1: Automation (Cyan) */}
                    <LiquidCard glowColor="from-brand-cyan/20 to-blue-500/20" className="p-5 md:p-8 flex flex-col justify-between min-h-[280px]">
                        <div className="relative z-10">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-4 md:mb-6 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:scale-110 transition-transform duration-500">
                                <Cpu size={20} className="md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-sm md:text-2xl font-bold text-white mb-2 leading-tight">Intelligent<br />Automation</h3>
                            <p className="text-[10px] md:text-sm text-slate-400 leading-relaxed hidden md:block">
                                Mimics human behavior with randomized delays and mouse movements.
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto pt-4">
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-brand-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Card 2: Speed/Quality (Purple) */}
                    <LiquidCard glowColor="from-purple-500/20 to-pink-500/20" className="p-5 md:p-8 flex flex-col justify-between min-h-[280px]">
                        <div className="relative z-10">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 md:mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform duration-500">
                                <Zap size={20} className="md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-sm md:text-2xl font-bold text-white mb-2 leading-tight">Rapid<br />Development</h3>
                            <p className="text-[10px] md:text-sm text-slate-400 leading-relaxed hidden md:block">
                                Fast script execution and delivery with guaranteed quality.
                            </p>
                        </div>
                        <div className="relative z-10 flex gap-1 mt-auto pt-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            <span className="text-[10px] text-purple-400 font-mono">QUALITY</span>
                        </div>
                    </LiquidCard>

                    {/* Card 3: Protection (Emerald) */}
                    <LiquidCard glowColor="from-emerald-500/20 to-teal-500/20" className="p-5 md:p-8 flex flex-col justify-between min-h-[280px]">
                        <div className="relative z-10">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 md:mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={20} className="md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-sm md:text-2xl font-bold text-white mb-2 leading-tight">Antidetect<br />Browser</h3>
                            <p className="text-[10px] md:text-sm text-slate-400 leading-relaxed hidden md:block">
                                Advanced fingerprint spoofing and hardware ID masking.
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto pt-4">
                            <div className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded w-fit">
                                100% SAFE
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Card 4: Uptime (Blue) */}
                    <LiquidCard glowColor="from-blue-500/20 to-indigo-500/20" className="p-5 md:p-8 flex flex-col justify-between min-h-[280px]">
                        <div className="relative z-10">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 md:mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                                <Activity size={20} className="md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-sm md:text-2xl font-bold text-white mb-2 leading-tight">99.9%<br />Uptime</h3>
                            <p className="text-[10px] md:text-sm text-slate-400 leading-relaxed hidden md:block">
                                Enterprise-grade infrastructure ensuring 24/7 reliability.
                            </p>
                        </div>
                        <div className="relative z-10 h-8 mt-auto pt-4 opacity-50">
                            <svg viewBox="0 0 100 20" className="w-full h-full fill-none stroke-blue-500" preserveAspectRatio="none">
                                <path d="M0 20 Q 20 10, 40 10 T 80 5 T 100 0" strokeWidth="1.5" />
                                <path d="M0 20 L 100 20 L 100 0 Q 80 5, 40 10 Q 20 10, 0 20" className="fill-blue-500/20 stroke-none" />
                            </svg>
                        </div>
                    </LiquidCard>

                </div>
            </div>
        </section>
    );
};



export default function Landing({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
    useEffect(() => {
        const handleScroll = (e: CustomEvent<string>) => {
            const id = e.detail;
            if (id === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.addEventListener('R4B_SCROLL_TO', handleScroll as EventListener);
        return () => window.removeEventListener('R4B_SCROLL_TO', handleScroll as EventListener);
    }, []);
    return (
        <div className="font-sans antialiased text-white selection:bg-brand-cyan/30 selection:text-white">
            <AnimatedBackground />
            <Navbar onNavigate={onNavigate} />

            <div className="min-h-screen flex flex-col justify-center relative">
                <Hero onNavigate={onNavigate} />
                <PartnersTicker />
            </div>

            {/* Visual Workflow Editor Section */}
            <div id="builder" className="min-h-screen flex items-center bg-[#020617]">
                <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500">Loading Builder...</div>}>
                    <WorkflowEditor />
                </React.Suspense>
            </div>

            <div className="min-h-screen flex items-center bg-[#020617]">
                <Features />
            </div>

            {/* Social Proof: Recent Orders */}
            <div id="community" className="min-h-screen flex items-center bg-[#020617]">
                <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500">Loading Community...</div>}>
                    <RecentOrders />
                </React.Suspense>
            </div>

            {/* CTA Bottom & Footer */}
            <div className="min-h-screen flex flex-col bg-[#020617]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center relative z-10 px-6">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg leading-tight">
                                Ready to start your <br />
                                <span className="text-brand-cyan">Automation Empire?</span>
                            </h2>
                            <p className="text-slate-400 mb-10 text-lg">Join the elite community of automated business builders today.</p>
                            <Button size="lg" onClick={() => onNavigate('shop')} className="rounded-full px-12 h-16 bg-gradient-to-r from-brand-cyan to-blue-600 text-white font-bold text-lg border-none hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all hover:scale-105">
                                Enter Marketplace
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}