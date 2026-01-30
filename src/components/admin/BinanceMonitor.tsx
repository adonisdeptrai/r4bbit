import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Terminal, Bitcoin, TrendingUp, TrendingDown, Wallet, Database, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { cn } from '../common';

interface BinanceMonitorProps {
    className?: string;
}

const BinanceMonitor = ({ className }: BinanceMonitorProps) => {
    const [history, setHistory] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'raw' | 'logs'>('dashboard');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [transactionType, setTransactionType] = useState<'all' | 'spot' | 'deposit' | 'withdraw'>('all');

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/settings/binance-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: transactionType === 'all' ? undefined : transactionType,
                    limit: 100
                })
            });
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'raw' || activeTab === 'dashboard') {
            fetchHistory();
        }
    }, [activeTab, transactionType]);

    // Computed Stats
    const stats = useMemo(() => {
        if (!history) return { total: 0, volume: 0, lastActivity: null };

        const transactions = history.combined || [];
        const total = transactions.length;

        // Calculate volume (sum of all amounts in USD equivalent - simplified)
        const volume = transactions.reduce((sum: number, tx: any) => {
            if (tx.type === 'spot') {
                return sum + (tx.quoteQuantity || 0);
            }
            return sum;
        }, 0);

        const lastActivity = transactions.length > 0 ? transactions[0].date : null;

        return { total, volume, lastActivity };
    }, [history]);

    const combinedTransactions = useMemo(() => {
        if (!history) return [];
        return history.combined || [];
    }, [history]);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20">
                            <Bitcoin className="text-white" size={24} />
                        </div>
                        Crypto History
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 ml-1">Monitor Binance transactions, deposits, and withdrawals.</p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-auto">
                    <div className="flex bg-white/5 rounded-xl p-1.5 border border-white/10">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: Activity },
                            { id: 'raw', label: 'Raw Data', icon: Database },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                                    <Activity size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Transactions</span>
                            </div>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {loadingHistory ? '...' : stats.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">All time activity</p>
                        </div>

                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                    <Wallet size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Volume</span>
                            </div>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {loadingHistory ? '...' : `$${stats.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Spot trading volume (USDT)</p>
                        </div>

                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    <TrendingUp size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Latest Activity</span>
                            </div>
                            <div className="text-lg font-bold text-white tracking-tight">
                                {loadingHistory ? '...' : stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'N/A'}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : 'No recent activity'}
                            </p>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Database className="text-amber-500" size={20} />
                                    Recent Transactions
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Latest crypto activity from Binance.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value as any)}
                                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                                >
                                    <option value="all">All Types</option>
                                    <option value="spot">Spot Trading</option>
                                    <option value="deposit">Deposits</option>
                                    <option value="withdraw">Withdrawals</option>
                                </select>
                                <Button
                                    onClick={fetchHistory}
                                    disabled={loadingHistory}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                                >
                                    <RefreshCw size={16} className={cn(loadingHistory && "animate-spin")} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4 font-bold">Time</th>
                                        <th className="p-4 font-bold">Type</th>
                                        <th className="p-4 font-bold">Symbol/Coin</th>
                                        <th className="p-4 font-bold">Amount</th>
                                        <th className="p-4 font-bold">Side/Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {combinedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                                                    <Search size={32} className="opacity-50" />
                                                    <p>{loadingHistory ? 'Loading transactions...' : 'No transactions found.'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        combinedTransactions.slice(0, 20).map((tx: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-slate-400 text-xs font-mono">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={cn(
                                                        "font-bold capitalize",
                                                        tx.type === 'spot' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                            tx.type === 'deposit' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    )}>
                                                        {tx.type}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-white font-mono font-bold">
                                                    {tx.symbol || tx.coin || 'N/A'}
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">
                                                    {tx.type === 'spot' ? (
                                                        <span>{tx.quantity?.toFixed(6)} ({tx.quoteQuantity?.toFixed(2)} USDT)</span>
                                                    ) : (
                                                        <span>{tx.amount?.toFixed(6)}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {tx.type === 'spot' ? (
                                                        <Badge className={cn(
                                                            "flex items-center gap-1 w-fit font-bold",
                                                            tx.side === 'BUY'
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        )}>
                                                            {tx.side === 'BUY' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                                            {tx.side}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">{tx.status}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* RAW DATA VIEW */}
            {activeTab === 'raw' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Type Filters */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-medium">Filter:</span>
                        {['all', 'spot', 'deposit', 'withdraw'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTransactionType(type as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                                    transactionType === type
                                        ? "bg-brand-cyan text-slate-900"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Raw Data Display */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Database className="text-amber-500" size={20} />
                                    Raw Transaction Data
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Unprocessed data directly from Binance API.</p>
                            </div>
                            <Button
                                onClick={fetchHistory}
                                disabled={loadingHistory}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                            >
                                <RefreshCw size={16} className={cn(loadingHistory && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>

                        <div className="p-6 bg-black/20 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
                            <pre className="text-xs text-slate-300 font-mono">
                                {loadingHistory ? 'Loading...' : JSON.stringify(history, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BinanceMonitor;
