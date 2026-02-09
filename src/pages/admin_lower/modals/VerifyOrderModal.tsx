/**
 * Verify Order Modal
 * Modal for confirming payment verification
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../components/common';

interface VerifyOrderModalProps {
    order: any;
    onClose: () => void;
    onConfirm?: () => void;
}

export const VerifyOrderModal = ({ order, onClose, onConfirm }: VerifyOrderModalProps) => {
    return createPortal(
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0b1121] rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden border border-white/10"
            >
                <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Verify Payment</h3>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400 text-sm">Order ID</span>
                            <span className="font-mono font-bold text-slate-300">{order.id}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400 text-sm">Amount</span>
                            <span className="font-bold text-green-400">${order.amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Method</span>
                            <span className="font-medium text-white">{order.method}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 text-slate-400 hover:text-white hover:bg-white/5" onClick={onClose}>Cancel</Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none" onClick={onConfirm || onClose}>Confirm Payment</Button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default VerifyOrderModal;
