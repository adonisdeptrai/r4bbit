/**
 * Manage Product Modal
 * Modal for creating and editing products with live preview
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, X, Plus, Edit, Save, Key,
    Image as ImageIcon, Star, Layout
} from 'lucide-react';
import { Product, ProductType } from '../../../types';
import { Button, cn } from '../../../components/common';
import { getProductStyles } from '../helpers';

interface ManageProductModalProps {
    product?: Product | null;
    onClose: () => void;
    onSave: (p: any) => void;
}

export const ManageProductModal = ({ product, onClose, onSave }: ManageProductModalProps) => {
    const isEdit = !!product;

    // Initial State
    const [formData, setFormData] = useState<Partial<Product> & { stock?: number, unlimitedStock?: boolean }>(product || {
        title: '',
        type: ProductType.SCRIPT,
        price: 0,
        originalPrice: 0,
        description: '',
        image: '',
        features: [],
        rating: 5.0,
        sales: 0,
        platformId: '',
        stock: 0,
        unlimitedStock: true
    } as any);

    // Toggle Preview for smaller screens
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    // For Key Pre-loading
    const [keysInput, setKeysInput] = useState('');

    // Tag Input Logic
    const [featureInput, setFeatureInput] = useState('');

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleKeysInputChange = (text: string) => {
        setKeysInput(text);
        if (!formData.unlimitedStock) {
            const count = text.split('\n').filter(l => l.trim() !== '').length;
            if (count > 0) {
                handleChange('stock', count);
            }
        }
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            const newFeatures = [...(formData.features || []), featureInput.trim()];
            handleChange('features', newFeatures);
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        const newFeatures = (formData.features || []).filter((_, i) => i !== index);
        handleChange('features', newFeatures);
    };

    // Live Preview Component
    const PreviewCard = () => {
        const styles = getProductStyles(formData.type || ProductType.SCRIPT);
        const Icon = styles.icon;

        return (
            <div className={cn(
                "relative flex flex-col w-full bg-[#0f172a] rounded-2xl overflow-hidden",
                "border border-white/10 shadow-xl transition-all duration-300",
                `shadow-${styles.color.split('-')[1]}-500/10`
            )}>
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5 group">
                    {formData.image ? (
                        <img
                            src={formData.image}
                            alt={formData.title}
                            className="w-full h-full object-cover mix-blend-multiply opacity-95"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-white/5">
                            <ImageIcon size={32} />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-t opacity-30",
                        styles.gradient
                    )} />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm border text-[10px] font-bold uppercase tracking-wide",
                            "bg-white/90 border-white/50 text-brand-dark"
                        )}>
                            <Icon size={10} className={styles.color} />
                            {formData.type}
                        </div>

                        {formData.originalPrice && formData.price && formData.originalPrice > formData.price && (
                            <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm shadow-rose-500/30">
                                -{Math.round((1 - formData.price / formData.originalPrice) * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col">
                    <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2">
                        {formData.title || 'Product Title'}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 mb-4">
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                            <Star size={10} fill="currentColor" /> {formData.rating || 5.0}
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <span>{0} reviews</span>
                    </div>

                    {/* Features Snippet */}
                    {formData.features && formData.features.length > 0 && (
                        <div className="mb-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Key Features</p>
                            <ul className="text-[10px] text-slate-500 list-disc pl-3 space-y-0.5">
                                {formData.features.slice(0, 2).map((f: string, i: number) => (
                                    <li key={i} className="line-clamp-1">{f}</li>
                                ))}
                                {formData.features.length > 2 && <li>+{formData.features.length - 2} more</li>}
                            </ul>
                        </div>
                    )}

                    {/* Footer: Price & Action */}
                    <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <div className="h-4 flex items-center mb-0.5">
                                {formData.originalPrice ? (
                                    <span className="text-[10px] text-slate-400 line-through">${formData.originalPrice}</span>
                                ) : null}
                            </div>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-bold text-white tracking-tight">${formData.price || 0}</span>
                                <span className="text-xs font-medium text-slate-500">USD</span>
                            </div>
                        </div>

                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md",
                            `bg-gradient-to-r ${styles.gradient}`
                        )}>
                            <Plus size={16} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md" onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="bg-[#0b1121] rounded-[2rem] shadow-2xl w-full max-w-[95vw] lg:max-w-6xl overflow-hidden relative z-10 flex flex-col h-[90vh] border border-white/10 ring-1 ring-white/5"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl shrink-0 relative z-20">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {isEdit ? <Edit size={18} className="text-brand-cyan" /> : <Plus size={18} className="text-brand-cyan" />}
                            {isEdit ? 'Edit Product' : 'Create New Product'}
                        </h3>
                        <p className="hidden md:block text-xs text-slate-400 mt-1 font-medium">
                            {isEdit ? 'Update product details and configuration.' : 'Add a new item to your marketplace catalog.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-300 rounded-full text-xs font-bold border border-white/10"
                            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                        >
                            <Layout size={14} /> {showPreviewMobile ? 'Show Form' : 'Show Preview'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body - Split View */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">

                    {/* LEFT: FORM INPUTS */}
                    <div className={cn(
                        "flex-1 min-w-0 overflow-y-auto p-6 lg:p-10 space-y-8 no-scrollbar scroll-smooth transition-all duration-300",
                        showPreviewMobile ? "hidden lg:block" : "block"
                    )}>

                        {/* Group 1: Basics */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                                Core Information
                            </h4>

                            <div className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-colors space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Product Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all font-medium"
                                            placeholder="e.g. Ultimate Automation Tool"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Category</label>
                                        <div className="relative">
                                            <select
                                                value={formData.type}
                                                onChange={(e) => handleChange('type', e.target.value)}
                                                className="w-full appearance-none bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all font-medium cursor-pointer"
                                            >
                                                {Object.values(ProductType).map((t) => (
                                                    <option key={t} value={t} className="bg-[#0b1121] text-white py-2">{t}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="w-full h-32 bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all resize-none leading-relaxed"
                                        placeholder="Highlight key benefits and requirements..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Group 2: Pricing & Stock */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                Pricing & Inventory
                            </h4>

                            <div className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-colors space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Price ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl pl-8 pr-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Original Price ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={formData.originalPrice}
                                                onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value))}
                                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl pl-8 pr-4 py-3.5 text-sm text-slate-400 focus:text-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Key-Specific Stock Logic */}
                                {formData.type === ProductType.KEY && (
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                                <Key size={16} className="text-emerald-500" />
                                                Unlimited Stock?
                                            </label>
                                            <button
                                                onClick={() => handleChange('unlimitedStock', !formData.unlimitedStock)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none",
                                                    formData.unlimitedStock ? "bg-emerald-500" : "bg-white/10"
                                                )}
                                            >
                                                <motion.div
                                                    animate={{ x: formData.unlimitedStock ? 24 : 4 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {!formData.unlimitedStock && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-2 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-xs font-bold text-emerald-400 uppercase">Import License Keys</label>
                                                            <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                One key per line
                                                            </span>
                                                        </div>
                                                        <textarea
                                                            value={keysInput}
                                                            onChange={(e) => handleKeysInputChange(e.target.value)}
                                                            className="w-full h-24 bg-[#020617] border border-emerald-500/30 focus:border-emerald-500 rounded-xl p-3 text-xs font-mono text-emerald-100 placeholder:text-emerald-900/50 focus:outline-none resize-none"
                                                            placeholder="Format:XXXX-XXXX-XXXX-XXXX..."
                                                        />
                                                        <div className="text-right text-[10px] text-emerald-500 font-bold">
                                                            Stock Count: {formData.stock}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Group 3: Media & Features */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                                Media & Details
                            </h4>

                            <div className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-colors space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Card Image URL</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => handleChange('image', e.target.value)}
                                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all font-mono"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Key Features (Tags)</label>

                                    <div className="bg-[#020617] border border-white/10 focus-within:border-brand-cyan/50 focus-within:ring-1 focus-within:ring-brand-cyan/50 rounded-xl p-2 min-h-[50px] flex flex-wrap gap-2 transition-all">
                                        <AnimatePresence>
                                            {(formData.features || []).map((feat, i) => (
                                                <motion.span
                                                    key={`${feat}-${i}`}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg border border-white/5"
                                                >
                                                    {feat}
                                                    <button
                                                        onClick={() => removeFeature(i)}
                                                        className="p-0.5 hover:bg-white/20 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                        <input
                                            type="text"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addFeature();
                                                }
                                            }}
                                            className="bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none flex-1 min-w-[120px] px-2 py-1.5 h-full"
                                            placeholder="Type feature & press Enter..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 pl-1">Press Enter to add a tag.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: PREVIEW (Sticky) */}
                    <div className={cn(
                        "lg:w-[450px] bg-[#020617]/50 border-l border-white/5 p-6 lg:p-10 flex flex-col justify-center items-center relative",
                        showPreviewMobile ? "block" : "hidden lg:flex"
                    )}>
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

                        <div className="relative z-10 w-full max-w-[340px] space-y-6">
                            <div className="text-center space-y-2 mb-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Live Preview</h4>
                                <p className="text-xs text-slate-600">This is how your product card will appear in the shop.</p>
                            </div>

                            <div className="transform transition-all hover:scale-[1.02] duration-500">
                                <PreviewCard />
                            </div>

                            {/* Save Actions */}
                            <div className="pt-8 w-full space-y-3">
                                <Button
                                    onClick={() => onSave(formData)}
                                    className="w-full h-14 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-brand-cyan/90 hover:to-blue-600/90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-brand-cyan/20 border-none relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <Save size={20} />
                                        {isEdit ? 'Save Changes' : 'Publish Product'}
                                    </span>
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-white hover:bg-white/5h-10 text-sm"
                                >
                                    Discard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <Button onClick={() => onSave(formData)} className="px-8 py-3 rounded-xl bg-brand-dark text-white hover:bg-brand-cyan shadow-xl shadow-brand-dark/10">
                        {isEdit ? 'Save Changes' : 'Create Product'}
                    </Button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default ManageProductModal;
