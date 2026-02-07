import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
ShoppingBag, Search, Filter, X, Plus, Minus, Trash2,
ArrowLeft, Star, Layers, Cpu, GraduationCap, Key, Box,
Sparkles, Zap, ArrowRight, CheckCircle, Info, LayoutGrid, List, Menu, Code, Heart
} from 'lucide-react';
import { Button, Badge, cn } from '../components/common';
import { ViewState, ProductType, Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from '../components/layout/UserMenu';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { ProductsAPI } from '../config/supabaseApi';
import ProductReviews from '../components/ProductReviews';
import { useWishlist } from '../contexts/WishlistContext';

// --- Constants ---
const CATEGORIES = ['ALL', ...Object.values(ProductType)];

// --- Helper: Get Tech Colors (Updated for Dark Mode) ---
const getProductColor = (type: ProductType) => {
switch (type) {
case ProductType.SCRIPT: return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Layers };
case ProductType.TOOL: return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Cpu };
case ProductType.COURSE: return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: GraduationCap };
case ProductType.KEY: return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Key };
default: return { text: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', icon: Box };
}
};

// --- Shared Logo Component ---
const Logo = ({ className }: { className?: string }) => (
<div className={cn(
"relative w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20",
className
)}>
<Code size={18} className="relative z-10" />
</div>
);

interface ProductCardProps {
product: Product;
onAdd: (p: Product) => void;
onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
const styles = getProductColor(product.type);
const Icon = styles.icon;
const { user } = useAuth();
const { isInWishlist, toggleWishlist } = useWishlist();
const inWishlist = isInWishlist(product.id);

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
whileHover={{ y: -4 }}
onClick={onClick}
className="group relative bg-[#0f172a]/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/40 overflow-hidden flex flex-col md:flex-row hover:border-brand-cyan/30 hover:shadow-brand-cyan/20 transition-all duration-300 ring-1 ring-white/5 w-full"
>
{/* Left: Image Section */}
<div className="w-full md:w-[420px] shrink-0 relative overflow-hidden bg-slate-900 group-hover:shadow-right-xl transition-all duration-500">
<div className="absolute inset-0 bg-slate-800 animate-pulse" />
{product.image ? (
<img
src={product.image}
alt={product.title}
className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out relative z-[1]"
onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
/>
) : (
<div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center absolute inset-0 z-[1]">
<div className="text-slate-600 text-6xl font-bold">{product.title.charAt(0)}</div>
</div>
)}
<div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80 md:opacity-50 z-[2]" />

{/* Mobile Badges */}
<div className="absolute top-5 left-5 md:hidden">
<div className={cn("backdrop-blur-xl bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg text-white", styles.border)}>
<Icon size={12} className={styles.text} /> {product.type}
</div>
</div>

{/* Wishlist Button */}
{user && (
<button
onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
className={`absolute top-5 right-5 p-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 ${inWishlist ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-black/40 border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/30'}`}
>
<Heart size={18} className={inWishlist ? 'fill-current' : ''} />
</button>
)}
</div>

{/* Right: Content Section */}
<div className="flex-1 p-6 md:p-10 flex flex-col relative min-w-0">
{/* Header: Badges & Rating */}
<div className="flex items-center justify-between mb-5">
<div className="hidden md:flex items-center gap-3">
<div className={cn("px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border bg-black/20 backdrop-blur-sm", styles.bg, styles.text, styles.border)}>
<Icon size={12} /> {product.type}
</div>
{product.platform && (
<div className="bg-slate-800/50 border border-white/5 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-wider">
{product.platform}
</div>
)}
</div>

<div className="flex items-center gap-2 text-amber-400 text-xs font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/10">
<Star size={14} fill="currentColor" />
<span className="text-sm">{product.rating}</span>
<span className="text-slate-500 font-medium ml-1">({product.reviewsCount || 0} reviews)</span>
</div>
</div>

{/* Title & Price */}
<div className="mb-5">
<h3 className="font-bold text-2xl md:text-3xl text-white mb-2 leading-tight tracking-tight group-hover:text-brand-cyan transition-colors duration-300">
{product.title}
</h3>
<div className="flex items-baseline gap-3">
<span className="text-3xl font-bold text-brand-cyan tracking-tight">${product.price.toFixed(2)}</span>
{product.originalPrice && (
<span className="text-base text-slate-600 line-through font-medium">${product.originalPrice.toFixed(2)}</span>
)}
</div>
</div>

{/* Description */}
<p className="text-base text-slate-300 leading-relaxed line-clamp-2 mb-6 max-w-2xl">
{product.description}
</p>

{/* Key Features Grid */}
{product.features && product.features.length > 0 && (
<div className="mb-8">
<h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Highlights</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
{product.features.slice(0, 4).map((feature, idx) => (
<div key={idx} className="flex items-center gap-2 text-sm text-slate-300/80">
<CheckCircle size={14} className="text-brand-cyan/80 shrink-0" />
<span className="truncate">{feature}</span>
</div>
))}
</div>
</div>
)}

{/* Actions */}
<div className="mt-auto flex gap-4 pt-6 border-t border-white/5">
<Button
onClick={(e) => { e.stopPropagation(); onAdd(product); }}
className="flex-1 bg-transparent border-2 border-white/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/5 hover:text-brand-cyan text-slate-300 font-bold h-12 rounded-xl text-sm transition-all duration-300"
>
<ShoppingBag size={18} className="mr-2" /> Add to Cart
</Button>
<Button
onClick={(e) => { e.stopPropagation(); onClick(); }}
className="flex-[1.5] bg-brand-cyan text-black hover:bg-[#5ff5ff] font-bold h-12 rounded-xl text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300"
>
<Zap size={18} className="mr-2" /> View Details
</Button>
</div>
</div>
</motion.div>
);
};

const ProductDetailModal = ({
product,
isOpen,
onClose,
onAdd,
onNavigate
}: {
product: Product | null,
isOpen: boolean,
onClose: () => void,
onAdd: (p: Product) => void,
onNavigate: (view: ViewState) => void
}) => {
const navigate = useNavigate();
const { user } = useAuth();
const { isInWishlist, toggleWishlist } = useWishlist();
if (!product || !isOpen) return null;
const styles = getProductColor(product.type);
const Icon = styles.icon;
const inWishlist = isInWishlist(product.id);

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
/>
<div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ type: "spring", duration: 0.4, bounce: 0 }}
className="bg-[#0b1121] w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl relative pointer-events-auto flex flex-col md:flex-row shadow-black/50"
>
<button
onClick={onClose}
className="absolute top-5 right-5 z-50 p-2 bg-black/40 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md border border-white/5"
>
<X size={18} />
</button>

{/* Wishlist Button */}
{user && (
<button
onClick={() => toggleWishlist(product.id)}
className={`absolute top-5 right-16 z-50 p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${inWishlist ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-black/40 border-white/5 text-white/60 hover:text-red-400 hover:border-red-500/30'}`}
>
<Heart size={18} className={inWishlist ? 'fill-current' : ''} />
</button>
)}

{/* Left: Image */}
<div className="w-full md:w-[45%] relative bg-[#020617] min-h-[250px] md:min-h-full p-3 md:p-5 shrink-0 flex flex-col justify-center">
<div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full rounded-[2rem] overflow-hidden border border-white/5 shadow-inner bg-slate-900">
<img
src={product.image}
alt={product.title}
className="w-full h-full object-cover opacity-90"
/>
<div className="absolute inset-0 bg-gradient-to-t from-[#0b1121] via-transparent to-transparent opacity-40"></div>
</div>
</div>

{/* Right: Details */}
<div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col min-w-0">
<div className="space-y-6 flex-1">
{/* Header: Badges & Rating */}
<div className="flex items-center gap-3">
<Badge className={cn("inline-flex backdrop-blur-md border font-bold items-center gap-1.5 shadow-sm px-2.5 py-1 text-[11px]", styles.bg, styles.text, styles.border)}>
<Icon size={12} /> {product.type}
</Badge>
<div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded-lg border border-amber-400/10">
<Star size={12} fill="currentColor" />
<span className="font-bold text-xs">{product.rating}</span>
<span className="text-slate-500 text-[10px] font-medium">({product.reviewsCount || 210} reviews)</span>
</div>
</div>

{/* Title & Price */}
<div>
<h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 tracking-tight break-words">{product.title}</h2>
<div className="text-3xl font-bold text-brand-cyan tracking-tight">${product.price.toFixed(2)}</div>
</div>

{/* Description */}
<div className="relative">
<p className="text-slate-300 leading-relaxed text-sm md:text-base pr-2 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
{product.description}
<br /><br />
Boost your e-commerce sales by automatically bumping your {product.title.toLowerCase()}. Cloud-based script, no need to keep your PC on. Optimized for performance and stability.
</p>
</div>

{/* Key Features Grid */}
<div>
<h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Key Features</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
{/* Merging static reference features with product features if available */}
{[{ text: 'Cloud hosted' }, { text: 'Unlimited shops' }, { text: 'Sales tracker' }, { text: 'Inventory sync' }].map((item, idx) => (
<div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-slate-300">
<div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-400">
<CheckCircle size={12} strokeWidth={3} />
</div>
<span className="truncate">{product.features?.[idx] || item.text}</span>
</div>
))}
</div>
</div>

{/* Reviews Section */}
<ProductReviews productId={product.id} productTitle={product.title} />
</div>

{/* Actions Footer */}
<div className="mt-8 flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-white/5">
<Button
size="lg"
onClick={() => onAdd(product)}
className="w-full sm:flex-1 bg-transparent border-2 border-white/20 hover:bg-white/5 text-white font-bold h-12 rounded-xl text-sm transition-all"
>
<ShoppingBag size={18} className="mr-2" /> Add to Cart
</Button>
<Button
size="lg"
onClick={() => {
// onAdd(product); // Removed onAdd as per request
onClose();
// Navigate with direct item state, bypassing cart
navigate('/checkout', { state: { directItem: product } });
}}
className="w-full sm:flex-1 bg-brand-cyan text-black hover:bg-[#5ff5ff] font-bold h-12 rounded-xl text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
>
<Zap size={18} className="mr-2 fill-black" /> Buy Now
</Button>
</div>
</div>
</motion.div>
</div>
</>
)}
</AnimatePresence>
);
};

const CartDrawer = ({
isOpen,
onClose,
items,
onRemove,
total,
onCheckout
}: {
isOpen: boolean,
onClose: () => void,
items: any[],
onRemove: (id: string) => void,
total: number,
onCheckout: () => void
}) => {
return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
/>
<motion.div
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0b1121] shadow-2xl z-[70] border-l border-white/10 flex flex-col"
>
<div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0b1121]/90 backdrop-blur-xl">
<div className="flex items-center gap-3">
<div className="p-2 bg-brand-cyan/10 rounded-xl text-brand-cyan border border-brand-cyan/20">
<ShoppingBag size={20} />
</div>
<h2 className="text-xl font-bold text-white">Your Cart</h2>
<Badge className="bg-brand-cyan text-black border-none font-bold">{items.length}</Badge>
</div>
<button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
<X size={20} />
</button>
</div>

<div className="flex-1 overflow-y-auto p-6 space-y-4">
{items.length === 0 ? (
<div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
<ShoppingBag size={48} className="opacity-20" />
<p>Your cart is empty.</p>
<Button variant="outline" onClick={onClose} className="border-white/10 text-slate-300 hover:text-white">Continue Shopping</Button>
</div>
) : (
items.map((item) => (
<motion.div
layout
key={item.id}
className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
>
<div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10">
<img src={item.image} className="w-full h-full object-cover opacity-80" alt="" />
</div>
<div className="flex-1 min-w-0">
<h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
<p className="text-xs text-slate-500 mb-2">{item.type}</p>
<div className="flex items-center justify-between">
<span className="font-bold text-brand-cyan">${item.price}</span>
<div className="flex items-center gap-3">
<span className="text-xs font-bold text-slate-400">x{item.quantity}</span>
<button
onClick={() => onRemove(item.id)}
className="text-slate-500 hover:text-red-400 transition-colors"
>
<Trash2 size={16} />
</button>
</div>
</div>
</div>
</motion.div>
))
)}
</div>

{items.length > 0 && (
<div className="p-6 border-t border-white/10 bg-[#0b1121] space-y-4">
<div className="space-y-2">
<div className="flex justify-between text-sm text-slate-400">
<span>Subtotal</span>
<span>${total.toFixed(2)}</span>
</div>
<div className="flex justify-between text-xl font-bold text-white">
<span>Total</span>
<span>${total.toFixed(2)}</span>
</div>
</div>
<Button size="lg" onClick={onCheckout} className="w-full justify-between group bg-brand-cyan text-black hover:bg-cyan-300 font-bold">
Checkout Now
<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
</Button>
</div>
)}
</motion.div>
</>
)}
</AnimatePresence>
)
};

const ProductCardMini: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
const styles = getProductColor(product.type);
const Icon = styles.icon;

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
whileHover={{ y: -6 }}
onClick={onClick}
className="group relative bg-[#0f172a]/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full cursor-pointer hover:border-brand-cyan/30 hover:shadow-brand-cyan/20 transition-all duration-300 ring-1 ring-white/5 hover:ring-brand-cyan/30"
>
{/* Image Section */}
<div className="relative aspect-[5/4] overflow-hidden bg-slate-900">
{product.image ? (
<img
src={product.image}
alt={product.title}
className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
/>
) : (
<div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
<div className="text-slate-600 text-4xl font-bold">{product.title.charAt(0)}</div>
</div>
)}
<div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />

{/* Badge (Top Left) */}
<div className="absolute top-4 left-4 z-10">
<div className={cn("backdrop-blur-xl bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg text-white", styles.border)}>
<Icon size={12} className={styles.text} /> {product.type}
</div>
</div>
</div>

{/* Content Section */}
<div className="p-6 flex-1 flex flex-col relative">
{/* Title & Rating */}
<div className="flex justify-between items-start mb-3 gap-3">
<h3 className="font-bold text-lg text-white leading-tight group-hover:text-brand-cyan transition-colors line-clamp-2">
{product.title}
</h3>
<div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
<Star size={12} className="text-amber-400 fill-amber-400" />
<span className="text-xs font-bold text-amber-400">{product.rating}</span>
</div>
</div>

{/* Tags */}
{product.features && (
<div className="flex flex-wrap gap-2 mb-4">
{product.features.slice(0, 2).map((tag, idx) => (
<span key={idx} className="bg-slate-800/50 text-slate-300 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">
#{tag}
</span>
))}
</div>
)}

{/* Description */}
<p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-6">
{product.description}
</p>

{/* Divider */}
<div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

{/* Footer: Price & Action */}
<div className="mt-auto flex items-center justify-between">
<div className="flex flex-col">
<span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Price</span>
<span className="text-2xl font-bold text-white tracking-tight">${product.price.toFixed(2)}</span>
</div>

<button
onClick={(e) => { e.stopPropagation(); onAdd(product); }}
className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-brand-cyan hover:text-black border border-white/10 flex items-center justify-center transition-all duration-300 group/btn shadow-lg"
title="Add to Cart"
>
<Plus size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
</button>
</div>
</div>
</motion.div>
);
};

export default function Shop({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
const { addItem, items, removeItem, total, isOpen, setIsOpen } = useCart();
const [activeFilter, setActiveFilter] = useState<string>('ALL');
const [searchQuery, setSearchQuery] = useState('');
const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid view
const [menuOpen, setMenuOpen] = useState(false);

// State for Product Detail Modal
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [products, setProducts] = useState<Product[]>([]);

React.useEffect(() => {
const fetchProducts = async () => {
try {
const data = await ProductsAPI.getAll();
setProducts(data);
} catch (error) {
console.error("Failed to fetch products:", error);
}
};
fetchProducts();
}, []);

const filteredProducts = useMemo(() => {
return products.filter(p => {
const matchesType = activeFilter === 'ALL' || p.type === activeFilter;
const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
p.features.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
return matchesType && matchesSearch;
});
}, [products, activeFilter, searchQuery]);

return (
<div className="min-h-screen font-sans text-white relative bg-[#020617] selection:bg-brand-cyan/30 selection:text-white">
<AnimatedBackground />

{/* Floating Navbar (Consistent with Landing) */}
<motion.nav
initial={{ y: -100, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
>
<div className="glass-panel rounded-full pl-6 pr-2 py-2 flex items-center gap-8 pointer-events-auto max-w-4xl w-full justify-between shadow-2xl shadow-black/50 border border-white/10 backdrop-blur-xl bg-[#020617]/80">
{/* Logo */}
<div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
<Logo />
<span className="font-bold text-lg tracking-tight text-white hidden sm:block">R4B <span className='text-slate-500 font-normal'>Market</span></span>
</div>

{/* Desktop Search */}
<div className="hidden md:block flex-1 max-w-sm mx-4">
<div className="relative group">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-brand-cyan transition-colors" size={16} />
<input
type="text"
placeholder="Search tools, scripts..."
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:bg-white/10 focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all text-white placeholder:text-slate-600"
/>
</div>
</div>

{/* Actions */}
<div className="flex items-center gap-2">
<button
onClick={() => setIsOpen(true)}
className="relative p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
>
<ShoppingBag size={20} />
{items.length > 0 && (
<span className="absolute top-1 right-1 w-2 h-2 bg-brand-cyan border border-[#020617] rounded-full"></span>
)}
</button>

<div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>
<div className="hidden md:block">
<UserMenu onNavigate={onNavigate} />
</div>

<button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
{menuOpen ? <X size={20} /> : <Menu size={20} />}
</button>
</div>
</div>
</motion.nav>

{/* Mobile Menu Overlay */}
<AnimatePresence>
{menuOpen && (
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
className="fixed top-24 left-4 right-4 z-40 glass-panel rounded-3xl p-6 md:hidden flex flex-col gap-4 border border-white/10 shadow-2xl bg-[#0b1121]/95 backdrop-blur-xl"
>
<div className="relative">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
<input
type="text"
placeholder="Search..."
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-cyan/50 text-white"
/>
</div>
<UserMenu onNavigate={onNavigate} />
<Button onClick={() => setMenuOpen(false)} className="w-full justify-center bg-white/10 text-white mt-2 font-bold">
Close Menu
</Button>
</motion.div>
)}
</AnimatePresence>


{/* Main Content (Padded for fixed navbar) */}
<div className="max-w-[96%] mx-auto px-4 md:px-6 pt-32 pb-24 relative z-10">
{/* Filters Header (With Layout Toggle) */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md"
>
<span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
<span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Premium Store</span>
</motion.div>
<h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Marketplace</h1>
<p className="text-slate-400 max-w-md">Upgrade your automation setup with enterprise-grade scripts and tools.</p>
</div>

<div className="flex flex-col items-end gap-4">
<div className="flex items-center bg-black/20 p-1 rounded-full border border-white/5 relative backdrop-blur-sm">
{(['list', 'grid'] as const).map((mode) => (
<button
key={mode}
onClick={() => setViewMode(mode)}
className={cn(
"relative px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition-colors z-10",
viewMode === mode ? "text-black" : "text-slate-400 hover:text-white"
)}
>
{viewMode === mode && (
<motion.div
layoutId="view-toggle-bg"
className="absolute inset-0 bg-brand-cyan rounded-full -z-10 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
/>
)}
{mode === 'list' ? <List size={16} /> : <LayoutGrid size={16} />}
<span className="capitalize">{mode}</span>
</button>
))}
</div>
<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
{CATEGORIES.map(cat => (
<button
key={cat}
onClick={() => setActiveFilter(cat)}
className={cn(
                                        "relative px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border z-10",
                                        "relative px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors overflow-hidden",
activeFilter === cat
                                            ? "text-black border-transparent"
                                            : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"
                                            ? "text-black"
                                            : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"
)}
>
{activeFilter === cat && (
                                        <motion.div
                                        <motion.span
layoutId="category-filter-bg"
                                            className="absolute inset-0 bg-brand-cyan rounded-full -z-10 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            className="absolute inset-0 bg-brand-cyan rounded-full"
                                            style={{ borderRadius: 9999 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
/>
)}
                                    {cat === 'ALL' ? 'All Products' : `${cat}s`}
                                    <span className="relative z-10">{cat === 'ALL' ? 'All Products' : `${cat}s`}</span>
</button>
))}
</div>
</div>
</div>

{/* Products Display */}
{filteredProducts.length > 0 ? (
viewMode === 'list' ? (
// List View
<div className="flex flex-col gap-6 max-w-4xl mx-auto">
{filteredProducts.map(product => (
<ProductCard
key={product.id}
product={product}
onAdd={(p) => {
addItem(p);
}}
onClick={() => setSelectedProduct(product)}
/>
))}
</div>
) : (
// Grid View (Mini Cards)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
{filteredProducts.map(product => (
<ProductCardMini
key={product.id}
product={product}
onAdd={(p) => {
addItem(p);
}}
onClick={() => setSelectedProduct(product)}
/>
))}
</div>
)
) : (
<div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-white/5 bg-white/5">
<div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-500">
<Search size={32} />
</div>
<h3 className="text-xl font-bold text-white mb-2">No products found</h3>
<p className="text-slate-500 max-w-md mx-auto">
Try adjusting your search or filters to find what you're looking for.
</p>
<Button
variant="outline"
className="mt-6 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
onClick={() => {
setSearchQuery('');
setActiveFilter('ALL');
}}
>
Clear Filters
</Button>
</div>
)}
</div>

{/* Cart Drawer */}
<CartDrawer
isOpen={isOpen}
onClose={() => setIsOpen(false)}
items={items}
onRemove={removeItem}
total={total}
onCheckout={() => {
setIsOpen(false);
onNavigate('checkout');
}}
/>

{/* Product Detail Modal */}
<ProductDetailModal
product={selectedProduct}
isOpen={!!selectedProduct}
onClose={() => setSelectedProduct(null)}
onAdd={(p) => {
addItem(p);
}}
onNavigate={onNavigate}
/>
</div>
);
