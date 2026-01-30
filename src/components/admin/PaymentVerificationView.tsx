import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Eye, DollarSign, FileText, User as UserIcon } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { cn } from '../common';
import { Order } from '../../types';
import { API_ENDPOINTS } from '../../config/api';

interface PaymentVerificationViewProps {
    orders?: Order[];
    history?: any[];
}

interface PendingOrder extends Order {
    matchStatus?: 'exact' | 'partial' | 'none' | 'pending';
    matchedTransaction?: any;
}

const PaymentVerificationView = ({ orders = [], history = [] }: PaymentVerificationViewProps) => {
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [searchCode, setSearchCode] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch pending orders from API
    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.ORDERS_PENDING, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // Analyze each order against transaction history
            const analyzed = data.map((order: Order) => analyzeOrderMatch(order));
            setPendingOrders(analyzed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Analyze if order has matching transaction
    const analyzeOrderMatch = (order: Order): PendingOrder => {
        if (!history || history.length === 0 || !Array.isArray(history.transactionInfos)) {
            return { ...order, matchStatus: 'pending' };
        }

        const orderCode = (order.orderId || order.id || '').replace('#', '').toUpperCase();
        const orderAmount = order.amount;

        const transactions = history.transactionInfos || [];

        // Find transactions containing order code
        const matchingTxs = transactions.filter((tx: any) => {
            const desc = (tx.description || '').toUpperCase();
            return desc.includes(orderCode);
        });

        if (matchingTxs.length === 0) {
            return { ...order, matchStatus: 'none' };
        }

        // Check for exact match
        const exactMatch = matchingTxs.find((tx: any) => {
            return parseFloat(tx.amount) === orderAmount && tx.creditDebitIndicator === 'CRDT';
        });

        if (exactMatch) {
            return { ...order, matchStatus: 'exact', matchedTransaction: exactMatch };
        }

        // Partial match (has code but wrong amount or type)
        return { ...order, matchStatus: 'partial', matchedTransaction: matchingTxs[0] };
    };

    // Filtered orders based on search
    const filteredOrders = useMemo(() => {
        if (!searchCode.trim()) return pendingOrders;
        const search = searchCode.toLowerCase();
        return pendingOrders.filter(order =>
            (order.orderId || order.id || '').toLowerCase().includes(search) ||
            (order.user || '').toLowerCase().includes(search)
        );
    }, [pendingOrders, searchCode]);

    // Get status badge
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'exact':
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle size={12} /> Exact Match
                </Badge>;
            case 'partial':
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                    <AlertCircle size={12} /> Partial Match
                </Badge>;
            case 'none':
                return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                    <XCircle size={12} /> No Match
                </Badge>;
            default:
                return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 flex items-center gap-1">
                    <Clock size={12} /> Pending
                </Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="text-amber-500" size={24} />
                        Payment Verification
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Review and manually verify payments when users transfer incorrect amounts
                    </p>
                </div>

                <div className="flex gap-3 self-stretch md:self-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by order code or username..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan text-white placeholder:text-slate-600 focus:bg-white/10 transition-all"
                        />
                    </div>
                    <Button
                        onClick={fetchPendingOrders}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 border-white/10"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Pending', value: pendingOrders.length, color: 'text-slate-400', bg: 'bg-slate-400/10' },
                    { label: 'Partial Matches', value: pendingOrders.filter(o => o.matchStatus === 'partial').length, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'No Matches', value: pendingOrders.filter(o => o.matchStatus === 'none').length, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'Awaiting', value: pendingOrders.filter(o => o.matchStatus === 'pending').length, color: 'text-blue-400', bg: 'bg-blue-400/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="p-4 font-bold">Order ID</th>
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Amount</th>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                                            <Search size={32} className="opacity-50" />
                                            <p>{loading ? 'Loading...' : searchCode ? 'No results found' : 'No pending bank transfer orders'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id || order._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-white font-mono font-bold">{order.orderId || order.id}</td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                    {(order.user || 'U').substring(0, 2).toUpperCase()}
                                                </div>
                                                {order.user}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-emerald-400">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.amount)}
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">
                                            {order.date ? new Date(order.date).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(order.matchStatus)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 text-xs"
                                            >
                                                <Eye size={14} className="mr-1" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comparison Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <ComparisonModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onVerified={fetchPendingOrders}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Comparison Modal Component
const ComparisonModal = ({ order, onClose, onVerified }: { order: PendingOrder, onClose: () => void, onVerified: () => void }) => {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleManualVerify = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.ORDER_MANUAL_VERIFY(order.orderId || order.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId: order.matchedTransaction?.id || order.matchedTransaction?.transactionId,
                    note,
                    receivedAmount: order.matchedTransaction?.amount || 0
                })
            });

            if (res.ok) {
                onClose();
                onVerified();
            } else {
                const data = await res.json();
                alert(data.message || 'Verification failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const diff = order.matchedTransaction ? (parseFloat(order.matchedTransaction.amount) - order.amount) : 0;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0b1121] rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden border border-white/10"
            >
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Payment Verification</h3>
                    <p className="text-sm text-slate-400 mt-1">Review transaction details and verify payment</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Comparison Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Expected (Order) */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-blue-400" size={18} />
                                <h4 className="font-bold text-white">Expected (Order)</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Order ID:</span>
                                    <span className="font-mono font-bold text-white">{order.orderId || order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Amount:</span>
                                    <span className="font-bold text-emerald-400">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">User:</span>
                                    <span className="text-white">{order.user}</span>
                                </div>
                            </div>
                        </div>

                        {/* Received (Transaction) */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="text-amber-400" size={18} />
                                <h4 className="font-bold text-white">Received (Transaction)</h4>
                            </div>
                            {order.matchedTransaction ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Amount:</span>
                                        <span className={cn(
                                            "font-bold",
                                            diff === 0 ? "text-emerald-400" : "text-amber-400"
                                        )}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(order.matchedTransaction.amount))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Description:</span>
                                        <span className="text-white text-xs text-right max-w-[150px] break-words">
                                            {order.matchedTransaction.description || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Date:</span>
                                        <span className="text-white text-xs">{order.matchedTransaction.bookingDate}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    No matching transaction found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Difference Alert */}
                    {order.matchedTransaction && diff !== 0 && (
                        <div className={cn(
                            "p-4 rounded-xl border flex items-start gap-3",
                            diff < 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"
                        )}>
                            <AlertCircle className={diff < 0 ? "text-rose-400" : "text-amber-400"} size={20} />
                            <div className="flex-1 text-sm">
                                <p className={cn("font-bold", diff < 0 ? "text-rose-400" : "text-amber-400")}>
                                    Amount Mismatch: {diff > 0 ? '+' : ''}{diff.toLocaleString('vi-VN')} VND
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                    {diff < 0 ? 'User transferred less than expected' : 'User transferred more than expected'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Code Check */}
                    {order.matchStatus !== 'none' && (
                        <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-start gap-3">
                            <CheckCircle className="text-emerald-400" size={20} />
                            <div className="flex-1 text-sm">
                                <p className="font-bold text-emerald-400">Order Code Present</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Transaction description contains order code
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Note Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Note / Reason</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. User confirmed via chat, bank charged transfer fee..."
                            className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-cyan resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleManualVerify}
                            disabled={submitting || !note.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                        >
                            {submitting ? 'Processing...' : 'Manual Verify & Complete'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentVerificationView;
