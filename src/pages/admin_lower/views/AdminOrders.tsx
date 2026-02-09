/**
 * Admin Orders
 * Orders management table with search functionality
 */

import React, { useState } from 'react';
import { Search, Package, X } from 'lucide-react';
import { Order } from '../../../types';
import { Button, Badge, cn, getStatusBadgeClass } from '../../../components/common';

interface AdminOrdersProps {
    onVerify: (order: Order) => void;
    orders: Order[];
}

export const AdminOrders = ({ onVerify, orders }: AdminOrdersProps) => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = safeOrders.filter((order: any) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            order.orderId?.toLowerCase().includes(query) ||
            order.id?.toLowerCase().includes(query) ||
            order.user?.toLowerCase().includes(query) ||
            order.product?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Order Management</h2>
                <div className="flex items-center gap-3">
                    {/* Search Box */}
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm mã GD, Order ID, User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan text-white placeholder:text-slate-500 focus:bg-white/10 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Order Count */}
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                        <span className="font-bold text-white">{filteredOrders.length}</span>
                        {searchQuery && ` / ${safeOrders.length}`} orders
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Mã GD</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">User</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Product</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Amount</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Method</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Status</th>
                                <th className="px-4 py-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{order.id}</td>
                                    <td className="px-4 py-3">
                                        {order.orderId ? (
                                            <code className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[10px] font-mono border border-blue-500/20">
                                                {order.orderId}
                                            </code>
                                        ) : (
                                            <span className="text-slate-600 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 flex items-center justify-center text-[10px] font-bold text-brand-cyan border border-white/5">
                                                {order.user.substring(0, 1).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-white">{order.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300 max-w-xs truncate">{order.product}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-white">${order.amount}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={cn(
                                            "text-[10px] font-bold",
                                            order.method === 'Bank Transfer'
                                                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                                        )}>
                                            {order.method || 'Crypto'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={cn("text-[10px] font-bold", getStatusBadgeClass(order.status))}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {order.status !== 'Completed' && (
                                            <Button
                                                size="sm"
                                                onClick={() => onVerify(order)}
                                                className="bg-white/10 text-white text-xs h-7 px-3 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all"
                                            >
                                                Verify
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            {searchQuery ? <Search size={24} /> : <Package size={24} />}
                        </div>
                        <p className="text-slate-400 text-sm">
                            {searchQuery ? `Không tìm thấy order với "${searchQuery}"` : 'No orders yet'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-3 text-brand-cyan text-xs hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
