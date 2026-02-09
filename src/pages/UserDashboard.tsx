import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Package, Clock, Shield, Download,
    ExternalLink, Copy, Wallet, ArrowUpRight, History,
    Key, Smartphone, ChevronRight, Lock, Bell,
    User as UserIcon, Mail, CheckCircle, Settings,
    ShoppingBag, TrendingUp, Sparkles, Eye, EyeOff,
    Calendar, Award, Zap, ArrowRight
} from 'lucide-react';
import { User, Order, OrderStatus } from '../types';
import { Button, Badge, cn, StatusBadge } from '../components/common';
import { API_ENDPOINTS } from '../config/api';

// Helper to determine asset type from product name
const getAssetType = (title: string): 'Script' | 'Course' | 'Key' => {
    if (title?.toLowerCase().includes('course')) return 'Course';
    if (title?.toLowerCase().includes('key') || title?.toLowerCase().includes('license')) return 'Key';
    return 'Script';
};

const getAssetIcon = (type: string) => {
    switch (type) {
        case 'Course': return Package;
        case 'Key': return Key;
        default: return Download;
    }
};

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', glow = false, ...props }: { children: React.ReactNode; className?: string; glow?: boolean;[key: string]: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
            "relative overflow-hidden rounded-3xl",
            "bg-white/[0.03] backdrop-blur-xl",
            "border border-white/[0.08]",
            "shadow-xl shadow-black/20",
            glow && "before:absolute before:inset-0 before:bg-gradient-to-br before:from-brand-cyan/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color = 'cyan' }: { icon: any; label: string; value: string | number; trend?: string; color?: 'cyan' | 'purple' | 'orange' | 'green' }) => {
    const colors = {
        cyan: 'from-brand-cyan/20 to-blue-500/20 text-brand-cyan',
        purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
        orange: 'from-orange-500/20 to-amber-500/20 text-orange-400',
        green: 'from-green-500/20 to-emerald-500/20 text-green-400'
    };

    return (
        <GlassCard className="p-6 group hover:scale-[1.02] transition-transform cursor-pointer" glow>
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-gradient-to-br", colors[color])}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </GlassCard>
    );
};

// ==================== USER OVERVIEW ====================
export const UserOverview = ({ user }: { user: User }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Script' | 'Course' | 'Key'>('All');
    const [showBalance, setShowBalance] = useState(true);

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const emoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(API_ENDPOINTS.ORDERS_MY, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);

                    const derivedAssets = data.map((order: any) => ({
                        id: order.id,
                        title: order.product,
                        type: getAssetType(order.product),
                        version: 'v1.0',
                        purchaseDate: new Date(order.date).toLocaleDateString(),
                        status: order.status === 'Completed' || order.status === 'Paid' ? 'Active' : 'Pending',
                        icon: getAssetIcon(getAssetType(order.product)),
                        image: API_ENDPOINTS.UPLOADS(`/uploads/${getAssetType(order.product) === 'Course' ? 'course-cover.png' : getAssetType(order.product) === 'Key' ? 'license-key.png' : 'node-spoofer.png'}`)
                    }));
                    setAssets(derivedAssets);
                }
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const counts = {
        Script: assets.filter(a => a.type === 'Script').length,
        Course: assets.filter(a => a.type === 'Course').length,
        Key: assets.filter(a => a.type === 'Key').length,
    };

    const filteredAssets = activeFilter === 'All'
        ? assets
        : assets.filter(asset => asset.type === activeFilter);

    const toggleFilter = (type: 'Script' | 'Course' | 'Key') => {
        setActiveFilter(prev => prev === type ? 'All' : type);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Skeleton Loading */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-56 rounded-3xl bg-white/5 animate-pulse" />
                    <div className="h-56 rounded-3xl bg-white/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            {/* Hero Section - Welcome + Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Wallet Card */}
                <GlassCard className="lg:col-span-2 p-8 min-h-[240px] flex flex-col justify-between">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20" />

                    <div className="relative z-10">
                        {/* Greeting */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-slate-400 font-medium">{greeting},</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                            {user.username}
                        </h2>

                        {/* Balance Display */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-brand-cyan/20">
                                    <Wallet size={18} className="text-brand-cyan" />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                    Available Balance
                                </span>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    {showBalance ? <Eye size={16} className="text-slate-400" /> : <EyeOff size={16} className="text-slate-400" />}
                                </button>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl md:text-6xl font-bold text-white tracking-tighter font-mono">
                                    {showBalance ? `$${user.balance?.toFixed(2) || '0.00'}` : '••••••'}
                                </span>
                                <span className="text-lg font-medium text-slate-500">USD</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 relative z-10">
                        <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-none shadow-lg shadow-brand-cyan/25 font-bold transition-all hover:scale-105">
                            <ArrowUpRight size={18} className="mr-2" /> Top Up
                        </Button>
                        <Button variant="secondary" className="h-12 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/10 font-bold transition-all">
                            <History size={18} className="mr-2" /> View History
                        </Button>
                    </div>
                </GlassCard>

                {/* Quick Stats Side Panel */}
                <div className="space-y-4">
                    <GlassCard className="p-6" glow>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                                <Key size={22} className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Active Assets</p>
                                <p className="text-3xl font-bold text-white">{assets.length}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['Script', 'Course', 'Key'] as const).map(type => (
                                <span key={type} className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded-full">
                                    {counts[type]} {type}s
                                </span>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6" glow>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <ShoppingBag size={22} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Orders</p>
                                <p className="text-3xl font-bold text-white">{orders.length}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Award} label="Member Since" value="2024" color="cyan" />
                <StatCard icon={Zap} label="Active Licenses" value={assets.filter(a => a.status === 'Active').length} color="orange" />
                <StatCard icon={TrendingUp} label="Total Spent" value={`$${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(0)}`} color="green" />
                <StatCard icon={Sparkles} label="Reward Points" value="2,450" trend="+12%" color="purple" />
            </div>

            {/* Assets Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-cyan/20">
                            <Package size={20} className="text-brand-cyan" />
                        </div>
                        My Assets
                    </h3>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
                    <button
                        onClick={() => setActiveFilter('All')}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            activeFilter === 'All'
                                ? "bg-gradient-to-r from-brand-cyan to-blue-500 text-white shadow-lg shadow-brand-cyan/25"
                                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                        )}
                    >
                        All Assets
                    </button>
                    {(['Script', 'Course', 'Key'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => toggleFilter(type)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                                activeFilter === type
                                    ? "bg-white/10 text-white border border-brand-cyan/50 shadow-lg shadow-brand-cyan/10"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                            )}
                        >
                            {type}s
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                activeFilter === type ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/10"
                            )}>
                                {counts[type]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredAssets.length > 0 ? filteredAssets.map((asset, index) => (
                            <motion.div
                                key={asset.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard className="p-4 group cursor-pointer hover:border-brand-cyan/30 transition-all" glow>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 overflow-hidden shrink-0 border border-white/10">
                                            <img
                                                src={asset.image}
                                                className="w-full h-full object-cover"
                                                alt={asset.title}
                                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/1e293b/64748b?text=Asset')}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Badge className="mb-2 text-[10px] px-2 py-0.5 bg-white/10 text-slate-300 border-white/10">
                                                {asset.type}
                                            </Badge>
                                            <h4 className="font-bold text-white text-sm truncate">{asset.title}</h4>
                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    asset.status === 'Active' ? "bg-green-500" : "bg-amber-500"
                                                )} />
                                                {asset.status}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-500 group-hover:text-brand-cyan transition-colors" />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full"
                            >
                                <GlassCard className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <Package size={32} className="text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 mb-4">No assets found</p>
                                    <Button variant="secondary" className="mx-auto">
                                        <ShoppingBag size={16} className="mr-2" /> Browse Store
                                    </Button>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20">
                        <History size={20} className="text-purple-400" />
                    </div>
                    Recent Activity
                </h3>

                <GlassCard className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                    <Clock size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">{order.product}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                        <Calendar size={12} />
                                        {new Date(order.date).toLocaleDateString()}
                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        {order.orderId}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <div className="font-bold text-white">${order.amount}</div>
                                    <StatusBadge status={order.status} variant="light" />
                                </div>
                                <ArrowRight size={16} className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                    {orders.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <Clock size={32} className="mx-auto mb-3 opacity-50" />
                            No recent activity
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

// ==================== USER ORDERS ====================
export const UserOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(API_ENDPOINTS.ORDERS_MY, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setOrders(data);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status?.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Order History</h2>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'pending', 'completed', 'cancelled'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all",
                                filter === f
                                    ? "bg-gradient-to-r from-brand-cyan to-blue-500 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className="p-5 group cursor-pointer hover:border-brand-cyan/30 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                                            <ShoppingBag size={24} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{order.product}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                                                <Calendar size={12} />
                                                {new Date(order.date).toLocaleDateString()}
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                {order.orderId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-white">${order.amount}</div>
                                            <div className="text-xs text-slate-400">{order.method}</div>
                                        </div>
                                        <StatusBadge status={order.status} variant="light" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )) : (
                        <GlassCard className="py-16 text-center">
                            <ShoppingBag size={48} className="mx-auto mb-4 text-slate-500" />
                            <p className="text-slate-400 mb-4">No orders found</p>
                            <Button className="mx-auto">Browse Products</Button>
                        </GlassCard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ==================== USER PROFILE ====================
export const UserProfile = ({ user }: { user: User }) => {
    return (
        <div className="space-y-6 pb-24 max-w-4xl mx-auto">
            {/* Profile Header */}
            <GlassCard className="p-8 text-center relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-brand-cyan/20 to-transparent" />
                <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px]" />

                <div className="relative z-10 pt-8">
                    {/* Avatar */}
                    <div className="w-28 h-28 mx-auto mb-4 relative group">
                        <div className="w-full h-full bg-gradient-to-br from-brand-cyan to-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-brand-cyan/25 border-4 border-[#0F172A]">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CreditCard size={24} className="text-white" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-white">{user.name || user.username}</h2>
                    <p className="text-slate-400">@{user.username}</p>

                    {/* Badges */}
                    <div className="flex justify-center gap-2 mt-4">
                        <Badge className="bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30">
                            <Sparkles size={12} className="mr-1" /> Pro Member
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle size={12} className="mr-1" /> Verified
                        </Badge>
                    </div>
                </div>
            </GlassCard>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <UserIcon size={18} className="text-brand-cyan" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-white">{user.email}</span>
                                <CheckCircle size={16} className="text-green-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white">
                                {user.username}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Security */}
                <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-brand-cyan" /> Security
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl text-slate-400 group-hover:text-brand-cyan">
                                    <Key size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-white">Change Password</span>
                                    <span className="block text-xs text-slate-400">Last changed 30 days ago</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-cyan" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl text-slate-400 group-hover:text-brand-cyan">
                                    <Smartphone size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-white">2FA Authentication</span>
                                    <span className="block text-xs text-slate-400">Enabled</span>
                                </div>
                            </div>
                            <div className="bg-green-500/20 text-green-400 p-1 rounded-full">
                                <CheckCircle size={14} />
                            </div>
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// ==================== USER SETTINGS ====================
export const UserSettings = ({ user }: { user: User }) => {
    const [notifications, setNotifications] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-cyan/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Settings className="text-brand-cyan" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-slate-400">Manage your account preferences</p>
            </GlassCard>

            {/* Settings List */}
            <GlassCard className="p-6 space-y-4">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-brand-cyan/20 rounded-xl">
                            <Bell size={20} className="text-brand-cyan" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Notifications</h4>
                            <p className="text-xs text-slate-400">Receive email updates about your orders</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                            notifications ? "bg-brand-cyan" : "bg-white/20"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                            notifications ? "translate-x-6" : "translate-x-1"
                        )} />
                    </button>
                </div>

                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Lock size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Two-Factor Auth</h4>
                            <p className="text-xs text-slate-400">Add an extra layer of security</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setTwoFactor(!twoFactor)}
                        className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                            twoFactor ? "bg-brand-cyan" : "bg-white/20"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                            twoFactor ? "translate-x-6" : "translate-x-1"
                        )} />
                    </button>
                </div>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="p-6 border-red-500/20">
                <h3 className="font-bold text-red-400 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                    <button className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 font-bold transition-colors text-left">
                        Logout from all devices
                    </button>
                    <button className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 font-bold transition-colors text-left">
                        Delete Account
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};