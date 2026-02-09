/**
 * Admin Overview
 * Dashboard overview with stats, charts, and recent transactions
 */

import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Package, DollarSign, TrendingUp, TrendingDown, CheckCircle
} from 'lucide-react';
import { User as UserIcon } from 'lucide-react';
import { Badge, cn } from '../../../components/common';
import { API_ENDPOINTS } from '../../../config/api';

export const AdminOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.STATS_OVERVIEW, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 animate-pulse">
                        <div className="h-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return <div className="text-white">Failed to load stats</div>;
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: `$${stats.revenue.total.toFixed(2)}`,
            change: `${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth}%`,
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            isPositive: stats.revenue.growth >= 0
        },
        {
            label: 'Total Orders',
            value: stats.orders.total.toString(),
            change: `${stats.orders.pending} pending`,
            icon: Package,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            isPositive: true
        },
        {
            label: 'Completed',
            value: stats.orders.completed.toString(),
            change: `${((stats.orders.completed / stats.orders.total) * 100).toFixed(0)}% rate`,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            isPositive: true
        },
        {
            label: 'Total Users',
            value: stats.users.total.toString(),
            change: `+${stats.users.growth} new`,
            icon: UserIcon,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            isPositive: true
        },
    ];

    const ordersDistribution = Object.entries(stats.orders.byStatus).map(([name, value]) => ({
        name,
        value: value as number,
        fill: name === 'Completed' ? '#10b981' : name === 'Paid' ? '#3b82f6' : '#f59e0b'
    }));

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:bg-white/10 transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                                <span className={cn(
                                    "text-xs font-bold flex items-center gap-1",
                                    stat.isPositive ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {stat.change}
                                </span>
                            </div>
                            <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" />
                        Revenue Trend (7 Days)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenue.trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0b1121',
                                        border: '1px solid #ffffff20',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Distribution Chart */}
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="text-blue-400" />
                        Orders Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ordersDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {ordersDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0b1121',
                                        border: '1px solid #ffffff20',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {stats.recentOrders.map((order: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 flex items-center justify-center text-sm font-bold text-brand-cyan border border-white/5">
                                    {order.user.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{order.user}</p>
                                    <p className="text-xs text-slate-400">{order.product}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">${order.amount}</p>
                                <Badge className={cn(
                                    "text-[10px]",
                                    order.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
