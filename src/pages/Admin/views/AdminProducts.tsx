/**
 * Admin Products
 * Products management table
 */

import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Product, ProductType } from '../../../types';
import { Button } from '../../../components/common';

interface AdminProductsProps {
    onEdit: (product: Product) => void;
    onAdd: () => void;
    onDelete?: (id: string) => void;
    filterType?: ProductType;
    products: Product[];
}

export const AdminProducts = ({ onEdit, onAdd, onDelete, filterType, products }: AdminProductsProps) => {
    const safeProducts = Array.isArray(products) ? products : [];
    const filtered = filterType ? safeProducts.filter((p) => p.type === filterType) : safeProducts;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{filterType ? `${filterType}s` : 'All Products'}</h2>
                <Button className="flex items-center gap-2 bg-brand-cyan text-black hover:bg-brand-cyan/80" onClick={onAdd}>
                    <Plus size={18} /> Add New
                </Button>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/10 p-6">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-white/5">
                            <th className="pb-4 pl-4">Product</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Sales</th>
                            <th className="pb-4 text-right pr-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 group transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                                            <img src={p.image} alt="" className="w-full h-full object-cover opacity-80" />
                                        </div>
                                        <span className="font-bold text-slate-200">{p.title}</span>
                                    </div>
                                </td>
                                <td className="py-4 font-mono text-sm text-brand-cyan">${p.price}</td>
                                <td className="py-4 text-sm text-slate-400">{p.sales}</td>
                                <td className="py-4 text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(p)} className="p-2 text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete && onDelete(p.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
