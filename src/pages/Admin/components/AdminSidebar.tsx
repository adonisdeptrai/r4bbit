/**
 * Admin Sidebar
 * Navigation sidebar for admin dashboard
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Layout, Package, Key, ShoppingBag, Activity,
    Wallet, MessageSquare, Settings, Laptop
} from 'lucide-react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '../../../components/common';

interface AdminSidebarProps {
    activeTab: string;
    onNavigate: (tab: string) => void;
}

const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'keys', label: 'License Keys', icon: Key },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: UserIcon },
    { id: 'bank', label: 'Transfer History', icon: Activity },
    { id: 'crypto', label: 'Crypto History', icon: Wallet },
    { id: 'messages', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar = ({ activeTab, onNavigate }: AdminSidebarProps) => {
    return (
        <div className="w-20 lg:w-64 flex-shrink-0 border-r border-white/10 bg-[#020617]/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20">
                    <Laptop size={20} />
                </div>
                <span className="font-bold text-xl text-white hidden lg:block tracking-tight">Admin<span className="text-brand-cyan">.</span></span>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            activeTab === item.id
                                ? "bg-brand-cyan text-black font-bold shadow-lg shadow-brand-cyan/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon size={20} className={cn(activeTab === item.id ? "text-black" : "group-hover:scale-110 transition-transform")} />
                        <span className="hidden lg:block text-sm">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-xs">
                        AD
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">Administrator</p>
                        <p className="text-[10px] text-slate-500 truncate">admin@r4b.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
