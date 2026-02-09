import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, RefreshCw, Wifi, Activity, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../common';

// --- Types for Simulation ---
interface LogEntry {
    id: number;
    timestamp: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'EARN';
    message: string;
}

export const HeroTerminal = React.memo(() => {
    // --- Simulation State ---
    const [earnings, setEarnings] = useState(4291.50);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [activeThreads, setActiveThreads] = useState(1024);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Force Auto-scroll
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTo({
                top: terminalRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logs]);

    // Simulation Loop
    useEffect(() => {
        const tasks = [
            { msg: "Connected to Proxy Node #8821", type: 'SUCCESS' },
            { msg: "Solving Captcha (Recaptcha V3)...", type: 'INFO' },
            { msg: "Bypassing Cloudflare Protection...", type: 'WARNING' },
            { msg: "Account #991 Login Verified", type: 'SUCCESS' },
            { msg: "Farming Resource Node (Area 51)...", type: 'INFO' },
            { msg: "Sold Rare Item: +$4.50", type: 'EARN', value: 4.50 },
            { msg: "Batch Job #442 Completed", type: 'SUCCESS' },
            { msg: "Syncing wallet data...", type: 'INFO' },
            { msg: "Lootbox opened: +$12.00", type: 'EARN', value: 12.00 },
            { msg: "Proxy rotated (IP: 192.168.x.x)", type: 'WARNING' },
            { msg: "Deposited to Wallet: +$8.20", type: 'EARN', value: 8.20 },
            { msg: "Script auto-updated to v3.1.2", type: 'SUCCESS' },
            { msg: "Thread #55 suspended (Rate limit)", type: 'ERROR' },
            { msg: "Thread #55 restarted", type: 'INFO' },
        ] as const;

        // Initial logs
        setLogs([
            { id: 1, timestamp: "10:00:01", type: "INFO", message: "System initialized" },
            { id: 2, timestamp: "10:00:02", type: "SUCCESS", message: "Connected to R4B Server" },
        ]);

        const interval = setInterval(() => {
            const task = tasks[Math.floor(Math.random() * tasks.length)];
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

            setLogs(prev => {
                const newLogs = [...prev, {
                    id: Date.now(),
                    timestamp,
                    type: task.type,
                    message: task.msg
                }];
                return newLogs.slice(-20);
            });

            if (task.type === 'EARN' && 'value' in task) {
                setEarnings(prev => prev + (task as any).value);
            }

            setActiveThreads(prev => {
                const change = Math.floor(Math.random() * 10) - 4;
                return Math.max(100, Math.min(2000, prev + change));
            });

        }, 1200);

        return () => clearInterval(interval);
    }, []);

    const getLogColor = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'text-green-400';
            case 'WARNING': return 'text-yellow-400';
            case 'ERROR': return 'text-red-400';
            case 'EARN': return 'text-brand-cyan font-bold shadow-brand-cyan/20';
            default: return 'text-blue-400';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ delay: 0.5, duration: 1, type: "spring", stiffness: 50 }}
            style={{ willChange: "transform, opacity" }}
            className="w-full relative perspective-1000"
        >
            {/* Glow behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-cyan/20 to-transparent blur-[100px] -z-10"></div>

            {/* Main Card */}
            <div className="relative bg-[#0F172A]/80 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10 group hover:ring-brand-cyan/30 transition-all duration-500">

                {/* Fake Browser/App Header */}
                <div className="h-10 md:h-12 border-b border-white/5 flex items-center px-4 md:px-6 justify-between bg-white/5">
                    <div className="flex gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[9px] md:text-[10px] text-slate-500 font-mono flex items-center gap-2">
                        <Lock size={8} />
                        <span className="hidden sm:inline">r4b-autofarmer-v3.exe</span>
                        <span className="sm:hidden">v3.0.exe</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] md:text-[10px] text-slate-400 font-mono">Connected</span>
                    </div>
                </div>

                {/* UI Body */}
                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Sidebar */}
                    <div className="hidden md:flex flex-col gap-2">
                        {['Dashboard', 'Active Bots', 'Proxy Manager', 'Wallet'].map((item, i) => (
                            <div key={item} className={cn(
                                "px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer transition-colors",
                                i === 1 ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            )}>
                                {item}
                                {i === 1 && <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>}
                            </div>
                        ))}

                        {/* Stats Card Mini */}
                        <div className="mt-auto p-4 rounded-xl bg-black/40 border border-white/5">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Uptime</div>
                            <div className="text-xl font-mono text-green-400">99.98%</div>
                        </div>
                    </div>

                    {/* Mobile Navigation Tabs */}
                    <div className="flex md:hidden overflow-x-auto gap-2 pb-2 -mx-2 px-2 no-scrollbar">
                        {['Overview', 'Bots', 'Proxies', 'Logs'].map((item, i) => (
                            <button key={item} className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap",
                                i === 3 ? "bg-brand-cyan text-black" : "bg-white/5 text-slate-400"
                            )}>
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-4 md:space-y-6">
                        {/* Status Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <div className="flex-1 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group/card hover:border-brand-cyan/30 transition-colors">
                                <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                <div className="text-[10px] md:text-xs text-slate-400 mb-1 flex items-center justify-between">
                                    Total Earnings
                                    <span className="text-green-500 bg-green-500/10 px-1.5 rounded text-[9px] md:text-[10px]">+${(Math.random() * 5).toFixed(2)}/m</span>
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                                    ${earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-[9px] md:text-[10px] text-green-400 flex items-center gap-1 mt-1">
                                    <Activity size={10} /> Live Tracking
                                </div>
                            </div>
                            <div className="flex-1 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-colors">
                                <div className="text-[10px] md:text-xs text-slate-400 mb-1">Active Threads</div>
                                <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">{activeThreads.toLocaleString()}</div>
                                <div className="text-[9px] md:text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                    <Wifi size={10} /> 100% Proxy Health
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE CONSOLE LOG */}
                        <div className="rounded-xl md:rounded-2xl bg-black/80 border border-white/10 p-3 md:p-4 font-mono text-[10px] md:text-xs h-56 md:h-48 overflow-hidden relative flex flex-col shadow-inner shadow-black">
                            {/* Scanline Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-20 opacity-20"></div>

                            {/* Header */}
                            <div className="flex justify-between items-center mb-2 md:mb-3 pb-2 border-b border-white/10 text-slate-500">
                                <span>TERMINAL OUTPUT</span>
                                <div className="flex gap-2">
                                    <RefreshCw size={10} className="animate-spin" />
                                </div>
                            </div>

                            {/* Logs Container */}
                            <div
                                ref={terminalRef}
                                className="flex-1 overflow-hidden space-y-1.5 relative z-10"
                            >
                                <AnimatePresence initial={false}>
                                    {logs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-2 text-[9px] md:text-[11px] leading-relaxed"
                                        >
                                            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                            <span className={cn("shrink-0 font-bold", getLogColor(log.type))}>{log.type}</span>
                                            <span className={cn("text-slate-300 truncate", log.type === 'EARN' ? "text-white" : "")}>{log.message}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {/* Blinking Cursor */}
                                <div className="flex items-center gap-2 text-slate-500 mt-2">
                                    <span className="text-brand-cyan">{'>'}</span> <span className="w-1.5 h-3 bg-brand-cyan animate-pulse"></span>
                                </div>
                            </div>

                            {/* Floating "Running" Badge */}
                            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 px-2 md:px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-[9px] md:text-[10px] font-bold animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.2)] backdrop-blur-md">
                                RUNNING
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Floating Elements - Redesigned to not obscure content */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: "transform" }}
                className="absolute -right-24 top-10 bg-[#0F172A]/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl z-20 hidden md:block hover:scale-105 transition-transform cursor-pointer ring-1 ring-purple-500/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-white uppercase tracking-wider">Speed Boost</div>
                        <div className="text-[9px] text-green-400 font-mono">OPTIMIZED</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ willChange: "transform" }}
                className="absolute -left-20 bottom-32 bg-[#0F172A]/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl z-20 hidden md:block hover:scale-105 transition-transform cursor-pointer ring-1 ring-brand-cyan/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-white uppercase tracking-wider">Protection</div>
                        <div className="text-[9px] text-green-400 font-mono">ACTIVE</div>
                    </div>
                </div>
            </motion.div>

        </motion.div>
    );
});
