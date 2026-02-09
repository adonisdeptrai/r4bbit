import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Package, Clock, Shield, Download,
    ExternalLink, Copy, Wallet, ArrowUpRight,
    History, Key, Bell, Smartphone, Monitor,
    FileCode, GraduationCap, PlayCircle, Lock, ChevronRight, Filter, X,
    User as UserIcon, Mail, CheckCircle, Settings
} from 'lucide-react';
import { User, Order, OrderStatus } from '../types';
import { Button, Badge, cn } from '../components/common';
import { API_ENDPOINTS } from '../config/api';

// Helper to determine asset type from product name
const getAssetType = (title: string): 'Script' | 'Course' | 'Key' => {
    if (title.includes('Course')) return 'Course';
    if (title.includes('License') || title.includes('Key')) return 'Key';
    return 'Script';
};

const getAssetIcon = (type: string) => {
    switch (type) {
        case 'Course': return GraduationCap;
        case 'Key': return Key;
        default: return FileCode;
    }
};

const StatusBadge = ({ status }: { status: OrderStatus | string }) => {
    const styles: Record<string, string> = {
        completed: 'bg-green-50 text-green-600 border-green-100',
        active: 'bg-green-50 text-green-600 border-green-100',
        Active: 'bg-green-50 text-green-600 border-green-100',
        processing: 'bg-blue-50 text-blue-600 border-blue-100',
        Pending: 'bg-blue-50 text-blue-600 border-blue-100', // API returns Pending
        failed: 'bg-red-50 text-red-600 border-red-100',
        expired: 'bg-slate-100 text-slate-500 border-gray-200',
        Expired: 'bg-slate-100 text-slate-500 border-gray-200',
        refunded: 'bg-gray-50 text-gray-600 border-gray-100',
        'Update Available': 'bg-amber-50 text-amber-600 border-amber-100',
        'In Progress': 'bg-violet-50 text-violet-600 border-violet-100',
        Paid: 'bg-green-50 text-green-600 border-green-100'
    };

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wide", styles[status] || styles.processing)}>
            {status}
        </span>
    );
};

export const UserOverview = ({ user }: { user: User }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Script' | 'Course' | 'Key'>('All');

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

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

                    // Derive assets from orders
                    const derivedAssets = data.map((order: any) => ({
                        id: order.id,
                        title: order.product,
                        type: getAssetType(order.product),
                        version: 'v1.0', // Mock version
                        purchaseDate: new Date(order.date).toLocaleDateString(),
                        status: order.status === 'Completed' || order.status === 'Paid' ? 'Active' : 'Pending',
                        icon: getAssetIcon(getAssetType(order.product)),
                        // Using a placeholder for asset preview since order doesn't have image
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

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-10 pb-24">
            {/* Header Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Main Wallet Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 text-white shadow-xl min-h-[220px] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8 h-full">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-slate-400 font-medium text-sm">{greeting},</p>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{user.username}</h2>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-lg bg-white/10">
                                        <Wallet size={14} className="text-brand-cyan" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Balance</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl md:text-6xl font-mono font-bold tracking-tighter text-white">${user.balance?.toFixed(2) || '0.00'}</span>
                                    <span className="text-lg font-medium text-slate-500">USD</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto mt-auto">
                            <Button className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-brand-cyan hover:bg-cyan-400 text-white border-none shadow-lg shadow-cyan-500/25 font-bold transition-transform active:scale-95">
                                <ArrowUpRight size={18} className="mr-2" /> Top Up
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-6 opacity-5">
                            <Key size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                    <Key size={20} />
                                </div>
                                <span className="font-bold text-slate-500 text-sm">Active Assets</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold text-brand-dark">{assets.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-6 opacity-5">
                            <History size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                    <History size={20} />
                                </div>
                                <span className="font-bold text-slate-500 text-sm">Total Orders</span>
                            </div>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-bold text-brand-dark">{orders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter UI */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-brand-dark flex items-center gap-2">
                        My Assets
                    </h3>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    <button onClick={() => setActiveFilter('All')} className={cn("px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border", activeFilter === 'All' ? "bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20 scale-105" : "bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>All Assets</button>
                    {(['Script', 'Course', 'Key'] as const).map(type => (
                        <button key={type} onClick={() => toggleFilter(type)} className={cn("px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2", activeFilter === type ? "bg-white text-brand-dark border-brand-cyan shadow-lg shadow-brand-cyan/10 scale-105 ring-1 ring-brand-cyan" : "bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                            {type}s
                            {activeFilter === type && <span className="ml-1 text-xs bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-full">{counts[type]}</span>}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                        <motion.div key={asset.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[20px] border border-gray-100 p-2 shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:border-brand-cyan/30">
                            <div className="flex items-center gap-5 p-2">
                                <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 relative">
                                    <img src={asset.image} className="w-full h-full object-cover mix-blend-multiply" alt={asset.title} onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image')} />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <Badge className="mb-2 text-[10px] px-2 py-0.5 bg-gray-50 text-slate-500">{asset.type}</Badge>
                                    <h4 className="font-bold text-brand-dark text-sm truncate pr-2">{asset.title}</h4>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><span className={cn("w-1.5 h-1.5 rounded-full", asset.status === 'Active' ? "bg-green-500" : "bg-amber-500")}></span>{asset.status}</div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-slate-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">No assets found.</div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-8">
                <h3 className="font-bold text-xl text-brand-dark mb-6 flex items-center gap-2"><History size={20} className="text-brand-cyan" /> Recent Activity</h3>
                <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm">
                    {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><Clock size={20} /></div>
                                <div>
                                    <div className="font-bold text-sm text-brand-dark">{order.product}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{new Date(order.date).toLocaleDateString()} • {order.orderId}</div>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="font-bold text-sm text-brand-dark">${order.amount}</div>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <div className="p-8 text-center text-slate-400">No recent orders.</div>}
                </div>
            </div>
        </div>
    );
};

export const UserOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);

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
                }
            }
        }
        fetchOrders();
    }, []);

    return (
        <div className="space-y-8 pb-24">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-brand-dark">Order History</h2>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm">
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Clock size={24} /></div>
                            <div>
                                <div className="font-bold text-base text-brand-dark">{order.product}</div>
                                <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{order.orderId}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                                <div className="font-bold text-base text-brand-dark">${order.amount}</div>
                                <div className="text-xs text-slate-400">{order.method}</div>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>
                )) : <div className="p-12 text-center text-slate-400">No orders found.</div>}
            </div>
        </div>
    )
}

export const UserProfile = ({ user }: { user: User }) => {
    return (
        <div className="space-y-8 pb-24 max-w-4xl mx-auto">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-cyan/10 to-blue-500/10"></div>
                <div className="relative z-10 pt-12">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-cyan to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white mb-4">
                        {(user.username || 'U').charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark">{user.name}</h2>
                    <p className="text-slate-400 text-sm">@{user.username}</p>
                    <div className="flex justify-center gap-3 mt-6">
                        <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">Pro Member</Badge>
                        <Badge className="bg-green-50 text-green-600 border-green-100">Verified</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2"><UserIcon size={18} className="text-slate-400" /> Personal Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                            <div className="font-medium text-slate-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                {user.email}
                                <CheckCircle size={16} className="text-green-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                            <div className="font-medium text-slate-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                {user.username}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2"><Shield size={18} className="text-slate-400" /> Security</h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-cyan/30 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-brand-cyan shadow-sm"><Key size={18} /></div>
                                <div className="text-left">
                                    <span className="block font-bold text-sm text-brand-dark">Change Password</span>
                                    <span className="block text-xs text-slate-400">Last changed 30 days ago</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-cyan" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-cyan/30 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-brand-cyan shadow-sm"><Smartphone size={18} /></div>
                                <div className="text-left">
                                    <span className="block font-bold text-sm text-brand-dark">2FA Authentication</span>
                                    <span className="block text-xs text-slate-400">Enabled</span>
                                </div>
                            </div>
                            <div className="bg-green-100 text-green-600 p-1 rounded-full"><CheckCircle size={14} /></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const UserSettings = ({ user }: { user: User }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-24">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                    <Settings />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark mb-2">Global Settings</h2>
                <p className="text-slate-500">Manage your account preferences and global configurations.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-brand-cyan shadow-sm"><Bell size={20} /></div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Notifications</h4>
                            <p className="text-xs text-slate-400">Receive email updates about your orders</p>
                        </div>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-cyan">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-brand-cyan shadow-sm"><Lock size={20} /></div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Two-Factor Auth</h4>
                            <p className="text-xs text-slate-400">Add an extra layer of security</p>
                        </div>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </div>
                </div>
            </div>
        </div>
    );
};