import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Globe, Cpu, ShieldCheck, Box, Zap, Monitor } from 'lucide-react';

const PARTNERS = [
    { name: 'GenLogin', icon: Layers },
    { name: 'GenFarmer', icon: Cpu },
    { name: 'GPMLogin', icon: Box },
    { name: 'AdsPower', icon: Zap },
    { name: 'GoLogin', icon: Globe },
    { name: 'Multilogin', icon: ShieldCheck },
    { name: 'Dolphin{anty}', icon: Monitor },
    { name: 'Incogniton', icon: Layers }, // Reusing Layers as placeholder for Incogniton depending on icon availability
];

// Duplicate list for infinite scroll effect
const SCROLL_ITEMS = [...PARTNERS, ...PARTNERS, ...PARTNERS];

export const PartnersTicker = () => {
    return (
        <section className="py-12 border-b border-white/5 bg-[#020617] relative overflow-hidden z-10">
            <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Trusted by Top Anti-Detect Software</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>

                <div className="animate-marquee flex items-center gap-12 whitespace-nowrap py-4">
                    {SCROLL_ITEMS.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default"
                        >
                            <partner.icon size={24} className="text-slate-300" />
                            <span className="text-xl font-bold text-slate-300">{partner.name}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 flex items-center gap-12 whitespace-nowrap py-4">
                    {SCROLL_ITEMS.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}-dup`}
                            className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default"
                        >
                            <partner.icon size={24} className="text-slate-300" />
                            <span className="text-xl font-bold text-slate-300">{partner.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
