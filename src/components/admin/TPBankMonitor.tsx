import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Terminal, CreditCard, CheckCircle, AlertCircle, Clock, Search, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Database, FileCheck, Layout, FileSearch } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { cn } from '../common';
import { Order } from '../../types';
import PaymentVerificationView from './PaymentVerificationView';
import { API_ENDPOINTS } from '../../config/api';

interface TPBankMonitorProps {
    orders?: Order[];
}

const TPBankMonitor = ({ orders = [] }: TPBankMonitorProps) => {
    const [settings, setSettings] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'verification' | 'raw' | 'logs'>('dashboard');
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.SETTINGS);
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SETTINGS_TPBANK_LOGS, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SETTINGS_TPBANK_HISTORY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleWorker = async () => {
        if (!settings) return;
        const newState = !settings.isAutoCheckEnabled;

        // Optimistic update
        setSettings({ ...settings, isAutoCheckEnabled: newState });

        try {
            const token = localStorage.getItem('token');
            await fetch(API_ENDPOINTS.SETTINGS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...settings, isAutoCheckEnabled: newState })
            });
            fetchLogs(); // Refresh logs to maybe show "Worker Stopped/Started" if we logged it (we didn't but good practice)
        } catch (err) {
            console.error(err);
            fetchSettings(); // Revert on error
        }
    };

    // Initial load
    useEffect(() => {
        fetchLogs();
        fetchSettings();
    }, []);

    // Change tab handler
    useEffect(() => {
        if (activeTab === 'raw') fetchHistory();
    }, [activeTab]);

    // --- Computed Stats ---
    const bankOrders = useMemo(() => orders.filter(o => o.method?.toLowerCase().includes('bank') && o.status === 'Completed'), [orders]);
    const totalBankRevenue = useMemo(() => bankOrders.reduce((sum, o) => sum + o.amount, 0), [bankOrders]);

    // API Status inferred from logs (if last log < 5 mins ago) AND settings toggle
    const apiStatus = useMemo(() => {
        if (settings?.isAutoCheckEnabled === false) return 'disabled';
        if (logs.length === 0) return 'unknown';
        const lastLog = new Date(logs[0].timestamp);
        const diff = Date.now() - lastLog.getTime();
        return diff < 5 * 60 * 1000 ? 'online' : 'idle';
    }, [logs, settings]);

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
                            <Activity className="text-white" size={24} />
                        </div>
                        Transfer History
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 ml-1">Monitor payments, API health, and transaction logs.</p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-auto">
                    {/* Worker Toggle */}
                    <div
                        onClick={toggleWorker}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-xl border cursor-pointer transition-all select-none",
                            settings?.isAutoCheckEnabled
                                ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors",
                            settings?.isAutoCheckEnabled ? "bg-emerald-500" : "bg-slate-600"
                        )}>
                            <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                settings?.isAutoCheckEnabled ? "left-5" : "left-1"
                            )} />
                        </div>
                        <span className={cn(
                            "text-sm font-bold",
                            settings?.isAutoCheckEnabled ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {settings?.isAutoCheckEnabled ? "Auto-Check ON" : "Auto-Check OFF"}
                        </span>
                    </div>

                    <div className="flex bg-white/5 rounded-xl p-1.5 border border-white/10">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: Layout },
                            { id: 'verification', label: 'Verify Payments', icon: FileSearch },
                            { id: 'raw', label: 'Raw Data', icon: Database },
                            { id: 'logs', label: 'System Logs', icon: Terminal },
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                    <Activity size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">API Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full animate-pulse",
                                    apiStatus === 'online' ? "bg-emerald-500" :
                                        apiStatus === 'disabled' ? "bg-rose-500" : "bg-amber-500"
                                )} />
                                <span className={cn(
                                    "text-2xl font-bold",
                                    apiStatus === 'online' ? "text-emerald-400" :
                                        apiStatus === 'disabled' ? "text-rose-400" : "text-amber-400"
                                )}>
                                    {apiStatus === 'online' ? 'Operational' :
                                        apiStatus === 'disabled' ? 'Disabled' : 'Idle / Sleeping'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Checking every 60s</p>
                        </div>

                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    <Wallet size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Bank Revenue</span>
                            </div>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBankRevenue)}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-blue-400/80 font-medium">+100% Verified</p>
                        </div>

                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                    <FileCheck size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Matched Trans.</span>
                            </div>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {bankOrders.length}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Successful auto-matches</p>
                        </div>
                    </div>

                    {/* Cleaned Data Table */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileCheck className="text-emerald-500" size={20} />
                                    Cleaned Data (Matched Orders)
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Transactions successfully matched with orders.</p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {bankOrders.length} Records
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4 font-bold">Order ID</th>
                                        <th className="p-4 font-bold">User</th>
                                        <th className="p-4 font-bold">Product</th>
                                        <th className="p-4 font-bold">Amount</th>
                                        <th className="p-4 font-bold">Date Verified</th>
                                        <th className="p-4 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {bankOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                                                    <Search size={32} className="opacity-50" />
                                                    <p>No matched bank transactions found yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        bankOrders.slice(0, 10).map((order: any) => (
                                            <tr key={order.orderId} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-white font-mono">{order.orderId}</td>
                                                <td className="p-4 text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {order.user?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        {order.user}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-300">{order.product}</td>
                                                <td className="p-4 font-bold text-emerald-400">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.amount)}
                                                </td>
                                                <td className="p-4 text-slate-400 text-xs">
                                                    {new Date(order.date).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1 w-fit">
                                                        <CheckCircle size={10} /> Verified
                                                    </Badge>
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

            {/* VERIFICATION VIEW */}
            {activeTab === 'verification' && (
                <PaymentVerificationView orders={orders} history={history} />
            )}

            {/* RAW DATA VIEW */}
            {activeTab === 'raw' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Database className="text-blue-500" size={20} />
                                    Raw Bank Data
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Unprocessed transaction history directly from TPBank.</p>
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

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4 font-bold">Time</th>
                                        <th className="p-4 font-bold">Amount</th>
                                        <th className="p-4 font-bold">Description (Content)</th>
                                        <th className="p-4 font-bold">Trans ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                                                {loadingHistory ? "Fetching from TPBank..." : "No recent transactions found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((tx: any, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02]">
                                                <td className="p-4 text-slate-300 font-mono text-xs">
                                                    {tx.bookingDate}
                                                </td>
                                                <td className={cn(
                                                    "p-4 font-bold font-mono",
                                                    parseFloat(tx.amount) > 0 ? "text-emerald-400" : "text-rose-400"
                                                )}>
                                                    {parseFloat(tx.amount) > 0 ? '+' : ''}
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(tx.amount))}
                                                </td>
                                                <td className="p-4 text-white max-w-md break-words text-xs">
                                                    {tx.description}
                                                </td>
                                                <td className="p-4 text-slate-500 font-mono text-xs">
                                                    {tx.transactionId}
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

            {/* LOGS VIEW */}
            {activeTab === 'logs' && (
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal size={16} className="text-slate-400" />
                            <span className="text-xs font-mono text-slate-400">/var/logs/tpbank-worker</span>
                        </div>
                        <button
                            onClick={fetchLogs}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-brand-cyan transition-colors"
                        >
                            <RefreshCw size={16} className={cn(loadingLogs && "animate-spin")} />
                        </button>
                    </div>
                    <div className="h-[600px] overflow-y-auto p-4 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-white/10 bg-black/20">
                        {logs.length === 0 ? (
                            <div className="text-slate-500 text-center py-20 italic">No logs found. Worker might be sleeping.</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id || log._id} className="flex gap-3 hover:bg-white/5 p-1.5 rounded transition-colors border-l-2 border-transparent hover:border-white/20">
                                    <span className="text-slate-500 min-w-[140px] opacity-70">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                    <span className={cn(
                                        "font-bold min-w-[80px]",
                                        log.type === 'SUCCESS' ? "text-emerald-400" :
                                            log.type === 'ERROR' ? "text-rose-400" :
                                                log.type === 'WORKER' ? "text-blue-400" :
                                                    "text-slate-300"
                                    )}>
                                        [{log.type}]
                                    </span>
                                    <span className="text-slate-300 break-all">{log.message}</span>
                                    {log.details && (
                                        <span className="text-slate-600 truncate max-w-xs opacity-60">
                                            {JSON.stringify(log.details)}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TPBankMonitor;
