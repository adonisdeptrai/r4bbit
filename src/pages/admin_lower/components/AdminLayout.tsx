/**
 * Admin Layout
 * Main layout wrapper for admin dashboard with header
 */

import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { User } from '../../../types';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
    user: User;
}

export const AdminLayout = ({ children, activeTab, onNavigate, user }: AdminLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-brand-cyan/30 selection:text-white">
            <AdminSidebar activeTab={activeTab} onNavigate={onNavigate} />
            <main className="flex-1 min-w-0 overflow-auto relative">
                {/* Header */}
                <header className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
                        <p className="text-xs text-slate-400">Welcome back, {user?.name || 'Admin'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-brand-cyan/50 text-white placeholder:text-slate-600 w-64 md:w-80 transition-all focus:w-96"
                            />
                        </div>
                        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative">
                            <MessageSquare size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
