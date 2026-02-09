/**
 * Key Management View
 * View for managing pending key orders and key inventory
 */

import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { User as UserIcon } from 'lucide-react';
import { Product, ProductType } from '../../../types';
import { Button, Badge } from '../../../components/common';
import { PendingKeyOrder } from '../types';
import { AdminProducts } from './AdminProducts';

interface KeyManagementViewProps {
    onEdit: (product: Product) => void;
    onAdd: () => void;
    onSendKey: (order: PendingKeyOrder) => void;
    pendingKeys: PendingKeyOrder[];
    products: Product[];
}

export const KeyManagementView = ({ onEdit, onAdd, onSendKey, pendingKeys, products }: KeyManagementViewProps) => {
    const safePendingKeys = Array.isArray(pendingKeys) ? pendingKeys : [];

    return (
        <div className="space-y-8">
            {/* Pending Fulfillment Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="text-amber-500" /> Pending Fulfillment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safePendingKeys.map((order) => (
                        <div key={order.id} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">{order.status}</Badge>
                                    <span className="text-xs font-mono text-slate-400">{order.date}</span>
                                </div>
                                <h4 className="font-bold text-white mb-1">{order.productName}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                    <UserIcon size={12} /> {order.user}
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>Qty: {order.quantity}</span>
                                </div>

                                <Button
                                    onClick={() => onSendKey(order)}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 border-none"
                                >
                                    Fulfill Order
                                </Button>
                            </div>
                        </div>
                    ))}
                    {safePendingKeys.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed text-slate-500">
                            <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
                            No pending key orders.
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory Section */}
            <AdminProducts onEdit={onEdit} onAdd={onAdd} filterType={ProductType.KEY} products={products} />
        </div>
    );
};

export default KeyManagementView;
