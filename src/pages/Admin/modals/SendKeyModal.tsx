/**
 * Send Key Modal
 * Modal for fulfilling key orders and sending licenses to customers
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Key, Mail } from 'lucide-react';
import { Button, Badge } from '../../../components/common';
import { PendingKeyOrder } from '../types';

interface SendKeyModalProps {
    order: PendingKeyOrder;
    onClose: () => void;
    onConfirm: (key: string) => void;
}

export const SendKeyModal = ({ order, onClose, onConfirm }: SendKeyModalProps) => {
    const [keyData, setKeyData] = useState('');

    const handleSend = () => {
        onConfirm(keyData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
                <div className="p-6 bg-emerald-600 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold">Fulfill Key Order</h3>
                            <p className="text-emerald-100 text-xs">Send license to {order.user}</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Key size={20} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-500">Product:</span>
                            <span className="font-bold text-brand-dark">{order.productName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Quantity:</span>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">x{order.quantity}</Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">License Key / Content</label>
                        <textarea
                            value={keyData}
                            onChange={(e) => setKeyData(e.target.value)}
                            className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none text-slate-800"
                            placeholder="Paste license keys here (one per line)..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
                        <Button
                            onClick={handleSend}
                            disabled={!keyData}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                        >
                            <Mail size={16} className="mr-2" /> Send & Complete
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default SendKeyModal;
