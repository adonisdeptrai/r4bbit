import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Globe, User, Clock, CheckCircle, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { cn } from '../common';

// --- Simulation Data ---
const PRODUCTS = [
    'AutoFarmer v3 (Lifetime)',
    'AutoFarmer v3 (Monthly)',
    'Proxy Rotator Pro',
    'Captcha Solver Enterprise',
    'Data Scraper Ultimate',
    'Anti-Detect Browser (Yearly)'
];

const PLACES = [
    'USA', 'Vietnam', 'Germany', 'UK', 'Brazil', 'Japan', 'France', 'Canada', 'Australia', 'Singapore'
];

const NAMES = [
    'Viktor P.', 'Kenji Sato', 'Marcelo Silva', 'Elena Vouk', 'James "Ghost" T.',
    'Nguyen Tan', 'Omar F.', 'Sofia Lopez', 'Maximilian', 'Arjun Patel',
    'Thiago R.', 'Oksana V.', 'Liam O.', 'Hassan A.', 'Isabella Ross'
];

const COMMENTS = [
    "Increased my farming yield significantly.",
    "Best investment for my automation setup.",
    "Support replied in 10 mins. thanks.",
    "Very stable, running 24/7 without crashes.",
    "Anti-detect is actually working on major sites.",
    "Pays for itself pretty quickly.",
    "Documentation is good, tool is solid.",
    "Smooth UI, easy to configure workflows.",
    "Proxy rotation is super fast.",
    "Works as described. Happy with the purchase.",
    "Finally found a script that doesn't get banned.",
    "Setup was a bit complex but worth it.",
    "Great updates recently. Keep it up."
];

interface Order {
    id: number;
    name: string;
    product: string;
    location: string;
    timeAgo: string;
    comment: string;
    rating: number;
}

export const RecentOrders = () => {
    // Initial state with some "older" data for realism
    const [orders, setOrders] = useState<Order[]>([
        { id: 1, name: 'Viktor P.', product: 'AutoFarmer v3 (Lifetime)', location: 'USA', timeAgo: '45 mins ago', comment: "Increased my farming yield significantly.", rating: 5 },
        { id: 2, name: 'Nguyen Tan', product: 'Proxy Rotator Pro', location: 'Vietnam', timeAgo: '2 hours ago', comment: "Proxy rotation is super fast.", rating: 5 },
        { id: 3, name: 'Elena Vouk', product: 'Captcha Solver Enterprise', location: 'Germany', timeAgo: '4 hours ago', comment: "Support replied in 10 mins. thanks.", rating: 4 },
        { id: 4, name: 'James "Ghost"', product: 'Anti-Detect Browser', location: 'UK', timeAgo: '6 hours ago', comment: "Very stable, running 24/7 without crashes.", rating: 5 },
    ]);

    // Simulate new orders coming in naturally (slower, random intervals)
    useEffect(() => {
        const scheduleNextOrder = () => {
            // Random interval between 15s and 60s (much slower/natural)
            const interval = 15000 + Math.random() * 45000;

            return setTimeout(() => {
                const newOrder = {
                    id: Date.now(),
                    name: NAMES[Math.floor(Math.random() * NAMES.length)],
                    product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
                    location: PLACES[Math.floor(Math.random() * PLACES.length)],
                    // Randomize the "Just now" vs "x mins ago"
                    timeAgo: Math.random() > 0.3 ? 'Just now' : '1 min ago',
                    comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
                    rating: Math.random() > 0.8 ? 4 : 5 // Mostly 5s, some 4s
                };

                setOrders(prev => [newOrder, ...prev].slice(0, 5));
                scheduleNextOrder(); // Recursively schedule next
            }, interval);
        };

        const timer = scheduleNextOrder();
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="w-full py-24 bg-[#020617] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-cyan/5 rounded-[100%] blur-[120px] pointer-events-none"></div>

            {/* Subtle Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                }}
            ></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <TrendingUp size={12} className="text-brand-cyan" />
                        Community Feed
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Real Results. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-500">Real Time.</span>
                    </h2>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-4 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 mx-2">
                    <div className="col-span-3 pl-2">Member</div>
                    <div className="col-span-4">Purchase</div>
                    <div className="col-span-5">Feedback</div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                className="group relative bg-[#0F172A]/40 hover:bg-[#1E293B]/50 backdrop-blur-md border border-white/5 hover:border-brand-cyan/20 rounded-2xl p-4 md:grid md:grid-cols-12 md:gap-6 md:items-center transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.05)]"
                            >
                                {/* Active Glow Line on Left */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-gradient-to-b from-transparent via-brand-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Column 1: Title / User */}
                                <div className="md:col-span-3 flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border-t border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-xl group-hover:scale-105 transition-transform duration-300">
                                            {order.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
                                            <Globe size={8} className="text-brand-cyan" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm tracking-tight group-hover:text-brand-cyan transition-colors">{order.name}</div>
                                        <div className="text-slate-500 text-[11px] font-medium">
                                            {order.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Recent Buy */}
                                <div className="md:col-span-4 mb-4 md:mb-0">
                                    <div className="flex flex-col h-full gap-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-cyan/5 border border-brand-cyan/10 group-hover:bg-brand-cyan/10 transition-colors">
                                                <ShoppingBag size={12} className="text-brand-cyan" />
                                                <span className="text-brand-cyan text-xs font-bold truncate max-w-[180px]">{order.product}</span>
                                            </div>
                                            {order.timeAgo === 'Just now' && (
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-slate-500 text-[11px] pl-1 flex items-center gap-1.5 font-medium">
                                            <Clock size={11} className="text-slate-600" />
                                            <span className="text-slate-500">{order.timeAgo}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 3: Comment */}
                                <div className="md:col-span-5 relative pl-4 md:pl-0 border-l md:border-l-0 border-white/5 py-1">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex gap-0.5">
                                            {[...Array(order.rating)].map((_, i) => (
                                                <Star key={i} size={10} className="fill-yellow-500 text-yellow-500" />
                                            ))}
                                            {[...Array(5 - order.rating)].map((_, i) => (
                                                <Star key={i} size={10} className="fill-slate-700 text-slate-700" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-xs md:text-sm italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        "{order.comment}"
                                    </p>
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
