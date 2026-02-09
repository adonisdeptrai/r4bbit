/**
 * Admin Dashboard
 * Main orchestrator component - imports all sub-modules
 * Refactored from 2235 lines to ~200 lines
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop } from 'lucide-react';
import { User, Product, ProductType } from '../types';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { ProductsAPI, OrdersAPI, UsersAPI } from '../config/supabaseApi';

// Import from modular admin structure
import { PendingKeyOrder, INITIAL_PENDING_KEYS } from './admin_lower/types';
import {
    VerifyOrderModal,
    SendKeyModal,
    ManageProductModal
} from './admin_lower/modals';
import {
    AdminOverview,
    AdminProducts,
    KeyManagementView,
    AdminOrders,
    AdminCustomers,
    AdminMessages,
    AdminSettings
} from './admin_lower/views';

// External admin components
import TPBankMonitor from '../components/admin/TPBankMonitor';
import BinanceMonitor from '../components/admin/BinanceMonitor';

export const AdminDashboard = ({ user, activeTab }: { user: User; activeTab: string }) => {
    // Shared State for Data
    const [orders, setOrders] = useState<any[]>([]);
    const [pendingKeyOrders, setPendingKeyOrders] = useState(INITIAL_PENDING_KEYS);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Fetch Data on Mount using supabaseApi
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                try {
                    const productsData = await ProductsAPI.getAll();
                    setProducts(productsData);
                } catch (e) { console.error("Failed to fetch products", e); }

                // Fetch Orders
                try {
                    const ordersData = await OrdersAPI.getAll();
                    setOrders(ordersData);
                } catch (e) { console.error("Failed to fetch orders", e); }

                // Fetch Users
                try {
                    const usersData = await UsersAPI.getAll();
                    setUsers(usersData);
                } catch (e) { console.error("Failed to fetch users", e); }

            } catch (error) {
                console.error("AdminDashboard: General fetch error:", error);
            }
        };
        fetchData();
    }, []);

    // State for Modals
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [verifyingOrder, setVerifyingOrder] = useState<any | null>(null);
    const [sendingKeyOrder, setSendingKeyOrder] = useState<PendingKeyOrder | null>(null);

    // Handlers
    const handleSaveProduct = async (formData: any) => {
        try {
            const isEdit = !!formData.id && !formData.id.startsWith('p');
            const url = isEdit
                ? API_ENDPOINTS.PRODUCT_BY_ID(formData.id)
                : API_ENDPOINTS.PRODUCTS;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedProduct = await res.json();
                setProducts(prev => {
                    if (isEdit) {
                        return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
                    } else {
                        return [savedProduct, ...prev];
                    }
                });
                setEditingProduct(null);
                setIsAddingProduct(false);
            } else {
                console.error("Failed to save product", await res.text());
                alert("Failed to save product. Check console.");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Error saving product.");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id), { method: 'DELETE' });
                if (res.ok) {
                    setProducts(prev => prev.filter(p => p.id !== id));
                } else {
                    alert("Failed to delete product.");
                }
            } catch (error) {
                console.error("Error deleting:", error);
            }
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

    const handleVerifyOrder = async () => {
        if (!verifyingOrder) return;
        try {
            const targetId = verifyingOrder.mongoId || verifyingOrder.id;
            const res = await fetch(API_ENDPOINTS.ORDER_VERIFY(targetId), { method: 'PUT' });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => (o.id === updatedOrder.id || o.id === verifyingOrder.id) ? updatedOrder : o));
                setVerifyingOrder(null);
            } else {
                alert("Failed to verify order.");
            }
        } catch (error) {
            console.error("Error verifying order:", error);
        }
    };

    const handleUpdateUserRole = async (id: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            } else {
                alert("Failed to update user role.");
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence>
                {(editingProduct || isAddingProduct) && (
                    <ManageProductModal
                        product={editingProduct}
                        onClose={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                        onSave={handleSaveProduct}
                    />
                )}
                {verifyingOrder && (
                    <VerifyOrderModal
                        order={verifyingOrder}
                        onClose={() => setVerifyingOrder(null)}
                        onConfirm={() => {
                            handleVerifyOrder();
                        }}
                    />
                )}
                {sendingKeyOrder && (
                    <SendKeyModal
                        order={sendingKeyOrder}
                        onClose={() => setSendingKeyOrder(null)}
                        onConfirm={handleConfirmSendKey}
                    />
                )}
            </AnimatePresence>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-7xl mx-auto overflow-visible"
            >
                {activeTab === 'overview' && <AdminOverview />}

                {activeTab === 'products' && (
                    <AdminProducts
                        onEdit={setEditingProduct}
                        onAdd={() => setIsAddingProduct(true)}
                        onDelete={handleDeleteProduct}
                        products={products}
                        filterType={ProductType.SCRIPT}
                    />
                )}

                {activeTab === 'tools' && (
                    <AdminProducts
                        onEdit={setEditingProduct}
                        onAdd={() => setIsAddingProduct(true)}
                        onDelete={handleDeleteProduct}
                        products={products}
                        filterType={ProductType.TOOL}
                    />
                )}

                {activeTab === 'courses' && (
                    <AdminProducts
                        onEdit={setEditingProduct}
                        onAdd={() => setIsAddingProduct(true)}
                        onDelete={handleDeleteProduct}
                        products={products}
                        filterType={ProductType.COURSE}
                    />
                )}

                {activeTab === 'keys' && (
                    <KeyManagementView
                        onEdit={setEditingProduct}
                        onAdd={() => setIsAddingProduct(true)}
                        onSendKey={setSendingKeyOrder}
                        pendingKeys={pendingKeyOrders}
                        products={products}
                    />
                )}

                {activeTab === 'orders' && <AdminOrders onVerify={setVerifyingOrder} orders={orders} />}
                {activeTab === 'customers' && <AdminCustomers users={users} onUpdateRole={handleUpdateUserRole} />}
                {activeTab === 'bank' && <TPBankMonitor orders={orders} />}
                {activeTab === 'crypto' && <BinanceMonitor />}
                {activeTab === 'messages' && <AdminMessages />}
                {activeTab === 'settings' && <AdminSettings />}

                {(activeTab === 'campaigns') && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-white/10 border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-500">
                            <Laptop size={32} />
                        </div>
                        <h3 className="font-bold text-slate-400">Coming Soon</h3>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;