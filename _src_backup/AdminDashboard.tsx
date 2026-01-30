import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ArrowUpRight, Filter, MoreHorizontal, 
  CreditCard, Smartphone, Laptop, Zap, Check, X,
  Plus, Search, Key, Download, Trash2, Edit,
  FileCode, Save, Copy, MessageSquare, User as UserIcon, Clock, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Server,
  Package, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Image as ImageIcon, GraduationCap, Star, Eye, Layers, Cpu, Tag, Layout,
  Infinity as InfinityIcon, Send, Mail, Wallet, Box
} from 'lucide-react';
import { User, Product, ProductType, Order } from './types';
import { Button, Badge, cn } from './components/UI';
import { PRODUCTS } from './constants';

// --- Types & Mock Data ---

interface Ticket {
    id: string;
    user: string;
    subject: string;
    status: 'Open' | 'Resolved' | 'Pending';
    date: string;
    priority: 'High' | 'Medium' | 'Low';
}

interface PendingKeyOrder {
    id: string;
    orderId: string;
    user: string;
    productName: string;
    quantity: number;
    date: string;
    status: 'Paid' | 'Processing' | 'Completed';
    amount: number;
    method: string;
}

const MOCK_TICKETS: Ticket[] = [
    { id: 'TCK-102', user: 'Alex_T88', subject: 'Key not working for GPM Login', status: 'Open', date: '10 mins ago', priority: 'High' },
    { id: 'TCK-101', user: 'MMO_Hunter', subject: 'How to setup proxy rotation?', status: 'Pending', date: '2 hours ago', priority: 'Medium' },
    { id: 'TCK-099', user: 'Newbie01', subject: 'Refund request for Course', status: 'Resolved', date: '1 day ago', priority: 'Low' },
];

const INITIAL_PENDING_KEYS: PendingKeyOrder[] = [
    { id: 'KORD-1', orderId: '#ORD-9920', user: 'MMO_Hunter', productName: 'GPM Login License', quantity: 1, date: '10 mins ago', status: 'Paid', amount: 15.00, method: 'Crypto (USDT)' },
    { id: 'KORD-2', orderId: '#ORD-9925', user: 'Sarah_K', productName: 'Multilogin 1 Month', quantity: 2, date: '1 hour ago', status: 'Paid', amount: 30.00, method: 'Bank Transfer' },
    { id: 'KORD-3', orderId: '#ORD-9930', user: 'DevOps_Guy', productName: 'GPM Login License', quantity: 1, date: '3 hours ago', status: 'Processing', amount: 15.00, method: 'Crypto (USDT)' },
];

const INITIAL_ORDERS = [
    { id: '#ORD-9921', user: 'Alex_T88', product: 'GenLogin Auto-Farmer', method: 'Crypto (USDT)', amount: 49.99, status: 'Pending Verification' },
    { id: '#ORD-9919', user: 'DevOps_Guy', product: 'MMO Toolset Pro', method: 'Crypto (USDT)', amount: 129.00, status: 'Completed' },
];

// --- Helpers ---

const getProductStyles = (type: ProductType) => {
  switch (type) {
    case ProductType.SCRIPT: return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Layers };
    case ProductType.TOOL: return { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Cpu };
    case ProductType.COURSE: return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: GraduationCap };
    case ProductType.KEY: return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Key };
    default: return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Box };
  }
};

// --- Components ---

const VerifyOrderModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-brand-dark mb-4">Verify Payment</h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
             <div className="flex justify-between mb-2">
                <span className="text-slate-500 text-sm">Order ID</span>
                <span className="font-mono font-bold">{order.id}</span>
             </div>
             <div className="flex justify-between mb-2">
                <span className="text-slate-500 text-sm">Amount</span>
                <span className="font-bold text-green-600">${order.amount}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Method</span>
                <span className="font-medium">{order.method}</span>
             </div>
          </div>
          <div className="flex gap-3">
             <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>Confirm Payment</Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const AdminOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
            { label: 'Total Revenue', value: '$124,592', change: '+12%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Active Orders', value: '24', change: '+5', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Pending Tickets', value: '12', change: '-2', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Total Users', value: '5,201', change: '+180', icon: UserIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-brand-dark">{stat.value}</h3>
                    <span className={cn("text-xs font-bold flex items-center gap-1 mt-1", stat.color)}>
                        <TrendingUp size={12} /> {stat.change}
                    </span>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                    <stat.icon size={20} />
                </div>
            </div>
        ))}
    </div>
);

const AdminProducts = ({ onEdit, onAdd, filterType, products = PRODUCTS }: any) => {
    const filtered = filterType ? products.filter((p: any) => p.type === filterType) : products;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-dark">{filterType ? `${filterType}s` : 'All Products'}</h2>
                <Button className="flex items-center gap-2" onClick={onAdd}>
                    <Plus size={18} /> Add New
                </Button>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-slate-400 uppercase border-b border-gray-100">
                            <th className="pb-4 pl-4">Product</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Sales</th>
                            <th className="pb-4 text-right pr-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p: any) => (
                            <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 group transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-slate-700">{p.title}</span>
                                    </div>
                                </td>
                                <td className="py-4 font-mono text-sm">${p.price}</td>
                                <td className="py-4 text-sm text-slate-500">{p.sales}</td>
                                <td className="py-4 text-right pr-4">
                                    <button onClick={() => onEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const KeyManagementView = ({ onEdit, onAdd, onSendKey, pendingKeys }: any) => (
    <div className="space-y-8">
        {/* Pending Fulfillment Section */}
        <div>
            <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Clock className="text-amber-500" /> Pending Fulfillment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingKeys.map((order: any) => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">{order.status}</Badge>
                                <span className="text-xs font-mono text-slate-400">{order.date}</span>
                            </div>
                            <h4 className="font-bold text-brand-dark mb-1">{order.productName}</h4>
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
                {pendingKeys.length === 0 && (
                     <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-100 border-dashed text-slate-400">
                         <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
                         No pending key orders.
                     </div>
                )}
            </div>
        </div>

        {/* Inventory Section */}
        <AdminProducts onEdit={onEdit} onAdd={onAdd} filterType="License Key" />
    </div>
);

const AdminOrders = ({ onVerify, orders }: any) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-dark">Order Management</h2>
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs uppercase text-slate-400 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm text-slate-500">{order.id}</td>
                            <td className="px-6 py-4 font-medium text-brand-dark">{order.user}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{order.product}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">${order.amount}</td>
                            <td className="px-6 py-4">
                                <Badge className={cn(
                                    order.status === 'Completed' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {order.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {order.status !== 'Completed' && (
                                    <Button size="sm" onClick={() => onVerify(order)} className="bg-brand-dark text-white text-xs h-8">Verify</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminCustomers = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-brand-dark">Customers</h2>
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-cyan" />
             </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-slate-400 font-bold">
                        U{i}
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-dark">User_{i}</h4>
                        <p className="text-xs text-slate-400">user{i}@example.com</p>
                    </div>
                    <div className="ml-auto">
                        <Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AdminMessages = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-dark">Support Tickets</h2>
        <div className="space-y-4">
            {MOCK_TICKETS.map((ticket) => (
                <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-cyan/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">{ticket.id}</span>
                            <Badge className={cn(
                                "text-[10px]",
                                ticket.priority === 'High' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                            )}>{ticket.priority}</Badge>
                        </div>
                        <span className="text-xs text-slate-400">{ticket.date}</span>
                    </div>
                    <h4 className="font-bold text-brand-dark mb-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <UserIcon size={12} /> {ticket.user}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AdminSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-brand-dark">System Settings</h2>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-gray-50 pb-2">General</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-brand-dark">Maintenance Mode</p>
                        <p className="text-xs text-slate-400">Disable store access for users</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-brand-dark">New User Registration</p>
                        <p className="text-xs text-slate-400">Allow new users to sign up</p>
                    </div>
                    <div className="w-12 h-6 bg-brand-cyan rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-gray-50 pb-2">Payment Gateways</h3>
            <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Wallet size={18}/></div>
                        <span className="font-medium">Crypto (USDT)</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={18}/></div>
                        <span className="font-medium">Bank Transfer</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                 </div>
            </div>
        </div>
    </div>
);

// --- Modals ---

const SendKeyModal = ({ order, onClose, onConfirm }: { order: PendingKeyOrder, onClose: () => void, onConfirm: (key: string) => void }) => {
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
                            className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none"
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

const ManageProductModal = ({ product, defaultType, onClose, onSave }: { product?: Product | null, defaultType?: ProductType, onClose: () => void, onSave: (p: any) => void }) => {
    const isEdit = !!product;
    
    // Initial State
    const [formData, setFormData] = useState<Partial<Product> & { stock?: number, unlimitedStock?: boolean }>(product || {
        title: '',
        type: defaultType || ProductType.SCRIPT,
        price: 0,
        originalPrice: 0,
        description: '',
        image: '',
        features: [],
        rating: 5.0,
        sales: 0,
        platformId: '',
        stock: 0, 
        unlimitedStock: true // Default to unlimited for keys
    } as any);

    // Toggle Preview for smaller screens
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    // For Features handling (Textarea to Array)
    const [featuresText, setFeaturesText] = useState(product?.features?.join('\n') || '');

    // For Key Pre-loading
    const [keysInput, setKeysInput] = useState('');

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeaturesChange = (text: string) => {
        setFeaturesText(text);
        const featureArray = text.split('\n').filter(line => line.trim() !== '');
        handleChange('features', featureArray);
    };

    const handleKeysInputChange = (text: string) => {
        setKeysInput(text);
        // Calculate stock based on lines only if we are in limited mode
        if (!formData.unlimitedStock) {
            const count = text.split('\n').filter(l => l.trim() !== '').length;
            if (count > 0) {
                handleChange('stock', count);
            }
        }
    };

    // Live Preview Component (Clean Tech Style)
    const PreviewCard = () => {
        const styles = getProductStyles(formData.type || ProductType.SCRIPT);
        const Icon = styles.icon;
        
        return (
            <div className="w-[240px] group relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                 {/* Image Area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100">
                    {formData.image ? (
                         <img 
                            src={formData.image} 
                            alt={formData.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gray-100">
                            <ImageIcon size={32} />
                        </div>
                    )}
                    
                    {/* Floating Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border uppercase tracking-wider flex items-center gap-1 bg-white/95",
                            styles.text, styles.border
                        )}>
                            <Icon size={10} /> {formData.type}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col relative">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-1">
                        {formData.title || 'Product Title'}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-[10px] text-slate-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-bold">#Tag1</span>
                        <span className="text-[10px] text-slate-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-bold">#Tag2</span>
                    </div>

                    <div className="mt-auto pt-2 border-t border-dashed border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-mono font-bold text-slate-900">${formData.price || 0}</span>
                                {formData.originalPrice ? (
                                    <span className="text-[10px] text-slate-400 line-through">${formData.originalPrice}</span>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" /> {formData.rating || 5}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-[95vw] lg:max-w-7xl overflow-hidden relative z-10 flex flex-col h-[90vh] md:h-[85vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                        <p className="hidden md:block text-xs text-slate-400">{isEdit ? `Editing: ${product?.title}` : 'Create a new item for the marketplace'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <button 
                            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-slate-600 rounded-lg text-xs font-bold"
                            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                         >
                            <Layout size={14} /> {showPreviewMobile ? 'Edit Form' : 'Preview'}
                         </button>
                         
                         <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                            <Eye size={12} /> Live Preview
                         </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-slate-400"><X size={20}/></button>
                    </div>
                </div>
                
                {/* Body - Split View */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    
                    {/* LEFT: FORM INPUTS */}
                    <div className={cn(
                        "flex-1 min-w-0 overflow-y-auto p-6 lg:p-8 space-y-8 bg-white transition-all duration-300",
                        showPreviewMobile ? "hidden lg:block" : "block"
                    )}>
                        
                        {/* Core Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-brand-dark border-b border-gray-100 pb-2">Product Details</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Product Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.title} 
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan transition-colors"
                                        placeholder="e.g. Super Auto Farmer" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Product Type</label>
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan"
                                    >
                                        <option value={ProductType.SCRIPT}>{ProductType.SCRIPT}</option>
                                        <option value={ProductType.TOOL}>{ProductType.TOOL}</option>
                                        <option value={ProductType.COURSE}>{ProductType.COURSE}</option>
                                        <option value={ProductType.KEY}>{ProductType.KEY}</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Key Specific Stock Setting - UPDATED MENU */}
                            {formData.type === ProductType.KEY && (
                                <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-emerald-900">Inventory Management</h4>
                                            <p className="text-[10px] text-emerald-600/80">Configure how keys are delivered.</p>
                                        </div>
                                    </div>

                                    {/* Custom Menu Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('unlimitedStock', true)}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                formData.unlimitedStock ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <InfinityIcon size={14} /> Unlimited Stock
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('unlimitedStock', false)}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                !formData.unlimitedStock ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <Key size={14} /> Pre-load Keys
                                        </button>
                                    </div>

                                    {/* Conditional Input */}
                                    <AnimatePresence mode="wait">
                                        {!formData.unlimitedStock ? (
                                            <motion.div 
                                                key="limited"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="space-y-4"
                                            >
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                                        Import Keys (One per line)
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            {formData.stock || 0} Keys Detected
                                                        </span>
                                                    </label>
                                                    <textarea 
                                                        value={keysInput}
                                                        onChange={(e) => handleKeysInputChange(e.target.value)}
                                                        className="w-full h-32 p-3 bg-white border border-emerald-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none placeholder:text-slate-300"
                                                        placeholder="AAAA-BBBB-CCCC-DDDD&#10;EEEE-FFFF-GGGG-HHHH"
                                                    />
                                                    <p className="text-[10px] text-slate-400">
                                                        Keys will be distributed sequentially. Stock count updates automatically.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="unlimited"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="p-4 bg-white rounded-xl border border-emerald-100 flex items-start gap-3"
                                            >
                                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                    <InfinityIcon size={20} />
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-emerald-900">Manual Fulfillment Mode</h5>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Use this for keys generated on-demand or manually sent after purchase. Stock will always show as "In Stock".
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Software Platform</label>
                                    <input 
                                        type="text" 
                                        value={formData.platformId || ''} 
                                        onChange={(e) => handleChange('platformId', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan" 
                                        placeholder="Platform Name (e.g. GenLogin)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={formData.image} 
                                            onChange={(e) => handleChange('image', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan" 
                                            placeholder="https://..."
                                        />
                                        <button className="p-3 bg-gray-100 rounded-xl text-slate-500 hover:bg-gray-200"><ImageIcon size={18} /></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-cyan resize-none" 
                                    placeholder="Describe the product features and benefits..."
                                ></textarea>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                    Key Features
                                    <span className="text-[10px] text-slate-400 normal-case">One feature per line</span>
                                </label>
                                <textarea 
                                    value={featuresText}
                                    onChange={(e) => handleFeaturesChange(e.target.value)}
                                    className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-cyan resize-none font-mono" 
                                    placeholder="- Anti-Fingerprint&#10;- Auto-Captcha&#10;- 24/7 Support"
                                ></textarea>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                             <h4 className="text-sm font-bold text-brand-dark pb-2">Pricing & Sales</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                                    <input 
                                        type="number" 
                                        value={formData.price} 
                                        onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Original Price ($)</label>
                                    <input 
                                        type="number" 
                                        value={formData.originalPrice} 
                                        onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value))}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan" 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className={cn(
                        "lg:w-[400px] bg-gray-50 p-6 lg:p-8 border-l border-gray-100 overflow-y-auto flex flex-col justify-center",
                         !showPreviewMobile ? "hidden lg:flex" : "flex"
                    )}>
                        <div className="text-center mb-6">
                            <h4 className="font-bold text-brand-dark mb-1">Live Preview</h4>
                            <p className="text-xs text-slate-400">This is how your product will appear in the shop.</p>
                        </div>
                        <div className="w-full max-w-sm mx-auto flex justify-center">
                           <PreviewCard />
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

export const AdminDashboard = ({ user, activeTab }: { user: User, activeTab: string }) => {
    // Shared State for Data
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [pendingKeyOrders, setPendingKeyOrders] = useState(INITIAL_PENDING_KEYS);
    const [products, setProducts] = useState(PRODUCTS); // Managed products state

    // State for Modals
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [verifyingOrder, setVerifyingOrder] = useState<any | null>(null);
    const [sendingKeyOrder, setSendingKeyOrder] = useState<PendingKeyOrder | null>(null);

    const handleSaveProduct = (formData: any) => {
        if (formData.id) {
            setProducts(prev => prev.map(p => p.id === formData.id ? formData : p));
        } else {
            const newProduct = { ...formData, id: `p${Date.now()}` };
            setProducts(prev => [newProduct, ...prev]);
        }
        setEditingProduct(null);
        setIsAddingProduct(false);
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleConfirmSendKey = (keyContent: string) => {
        if (!sendingKeyOrder) return;

        setPendingKeyOrders(prev => prev.filter(o => o.id !== sendingKeyOrder.id));

        const newCompletedOrder = {
            id: sendingKeyOrder.orderId,
            user: sendingKeyOrder.user,
            product: sendingKeyOrder.productName,
            method: sendingKeyOrder.method,
            amount: sendingKeyOrder.amount,
            status: 'Completed'
        };

        setOrders(prev => {
            const exists = prev.find(o => o.id === newCompletedOrder.id);
            if (exists) {
                return prev.map(o => o.id === newCompletedOrder.id ? { ...o, status: 'Completed' } : o);
            }
            return [newCompletedOrder, ...prev];
        });

        setSendingKeyOrder(null);
    };

    // Calculate default type based on active tab
    const defaultProductType = useMemo(() => {
        switch (activeTab) {
            case 'courses': return ProductType.COURSE;
            case 'keys': return ProductType.KEY;
            case 'tools': return ProductType.TOOL;
            default: return ProductType.SCRIPT;
        }
    }, [activeTab]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full relative"
        >
            <AnimatePresence>
                {(editingProduct || isAddingProduct) && (
                    <ManageProductModal 
                        product={editingProduct} 
                        defaultType={defaultProductType}
                        onClose={() => { setEditingProduct(null); setIsAddingProduct(false); }} 
                        onSave={handleSaveProduct}
                    />
                )}
                {verifyingOrder && <VerifyOrderModal order={verifyingOrder} onClose={() => setVerifyingOrder(null)} />}
                {sendingKeyOrder && (
                    <SendKeyModal 
                        order={sendingKeyOrder} 
                        onClose={() => setSendingKeyOrder(null)} 
                        onConfirm={handleConfirmSendKey}
                    />
                )}
            </AnimatePresence>

            {activeTab === 'overview' && <AdminOverview />}
            
            {activeTab === 'products' && (
                <AdminProducts 
                    onEdit={setEditingProduct} 
                    onAdd={() => setIsAddingProduct(true)}
                    products={products}
                />
            )}
            
            {activeTab === 'tools' && (
                 <AdminProducts 
                    onEdit={setEditingProduct} 
                    onAdd={() => setIsAddingProduct(true)}
                    filterType={ProductType.TOOL}
                    products={products}
                />
            )}
            
            {activeTab === 'courses' && (
                 <AdminProducts 
                    onEdit={setEditingProduct} 
                    onAdd={() => setIsAddingProduct(true)}
                    filterType={ProductType.COURSE}
                    products={products}
                />
            )}
            
            {activeTab === 'keys' && (
                <KeyManagementView 
                    onEdit={setEditingProduct}
                    onAdd={() => setIsAddingProduct(true)}
                    onSendKey={setSendingKeyOrder}
                    pendingKeys={pendingKeyOrders}
                />
            )}

            {activeTab === 'orders' && <AdminOrders onVerify={setVerifyingOrder} orders={orders} />}
            {activeTab === 'customers' && <AdminCustomers />}
            {activeTab === 'messages' && <AdminMessages />}
            {activeTab === 'settings' && <AdminSettings />}
            
            {(activeTab === 'campaigns') && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Laptop size={32} />
                    </div>
                    <h3 className="font-bold text-slate-500">Coming Soon</h3>
                </div>
            )}
        </motion.div>
    );
};