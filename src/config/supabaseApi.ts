/**
 * Supabase API Helper
 * Centralized functions for database operations
 */

import { supabase } from './supabase';
import { Product, Order, User } from '../types';

// ============== PRODUCTS ==============

export const ProductsAPI = {
    async getAll(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            description: p.description,
            features: p.features || [],
            image: p.image,
            rating: Number(p.rating) || 4.5,
            sales: p.sales || 0,
            reviewsCount: p.reviews_count || 0,
            stock: p.stock,
            unlimitedStock: p.unlimited_stock,
            platform: p.platform_id,
            platformId: p.platform_id
        }));
    },

    async getById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            title: data.title,
            type: data.type,
            price: Number(data.price),
            originalPrice: data.original_price ? Number(data.original_price) : undefined,
            description: data.description,
            features: data.features || [],
            image: data.image,
            rating: Number(data.rating) || 4.5,
            sales: data.sales || 0,
            reviewsCount: data.reviews_count || 0,
            stock: data.stock,
            unlimitedStock: data.unlimited_stock,
            platform: data.platforms?.name,
            platformId: data.platform_id
        };
    },

    async create(product: Partial<Product>): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .insert({
                title: product.title,
                type: product.type,
                price: product.price,
                original_price: product.originalPrice,
                description: product.description,
                features: product.features,
                image: product.image,
                rating: product.rating || 4.5,
                stock: product.stock,
                unlimited_stock: product.unlimitedStock,
                platform_id: product.platformId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .update({
                title: product.title,
                type: product.type,
                price: product.price,
                original_price: product.originalPrice,
                description: product.description,
                features: product.features,
                image: product.image,
                rating: product.rating,
                stock: product.stock,
                unlimited_stock: product.unlimitedStock,
                platform_id: product.platformId
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============== ORDERS ==============

export const OrdersAPI = {
    async getMyOrders(): Promise<Order[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('orders')
            .select(`*, products:product (title, image, type)`)
            .eq('user', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((o: any) => ({
            id: o.id,
            orderId: o.order_id,
            date: o.date || o.created_at,
            items: [o.products?.title || 'Unknown Product'],
            total: Number(o.amount),
            status: o.status,
            paymentMethod: o.method === 'crypto' ? 'Crypto' : 'Bank Transfer',
            invoiceUrl: '',
            amount: Number(o.amount),
            product: o.product
        }));
    },

    async getAll(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        products:product (title, image, type),
        users:user (username, email)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((o: any) => ({
            id: o.id,
            orderId: o.order_id,
            date: o.date || o.created_at,
            items: [o.products?.title || 'Unknown Product'],
            total: Number(o.amount),
            status: o.status,
            paymentMethod: o.method === 'crypto' ? 'Crypto' : 'Bank Transfer',
            invoiceUrl: '',
            amount: Number(o.amount),
            product: o.product,
            user: o.users?.username || o.user
        }));
    },

    async create(productId: string, amount: number, method: string): Promise<{ orderId: string }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase.rpc('create_order', {
            p_user_id: user.id,
            p_product_id: productId,
            p_amount: amount,
            p_method: method
        });

        if (error) throw error;
        return { orderId: data };
    },

    async updateStatus(orderId: string, status: string): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
    },

    async complete(orderId: string): Promise<void> {
        const { error } = await supabase.rpc('complete_order', {
            p_order_id: orderId
        });

        if (error) throw error;
    },

    async getById(id: string): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .select(`*, products:product (title, image, type)`)
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            orderId: data.order_id,
            date: data.date || data.created_at,
            items: [data.products?.title || 'Unknown Product'],
            total: Number(data.amount),
            status: data.status,
            paymentMethod: data.method === 'crypto' ? 'Crypto' : 'Bank Transfer',
            invoiceUrl: '',
            amount: Number(data.amount),
            product: data.product
        };
    }
};

// ============== USERS ==============

export const UsersAPI = {
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            name: u.username,
            email: u.email,
            role: u.role,
            balance: Number(u.balance) || 0,
            avatar: u.avatar
        }));
    },

    async getById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            username: data.username,
            name: data.username,
            email: data.email,
            role: data.role,
            balance: Number(data.balance) || 0,
            avatar: data.avatar
        };
    },

    async update(id: string, updates: Partial<User>): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({
                username: updates.username,
                avatar: updates.avatar
            })
            .eq('id', id);

        if (error) throw error;
    },

    async updateRole(id: string, role: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id);

        if (error) throw error;
    },

    async addBalance(userId: string, amount: number, description?: string): Promise<number> {
        const { data, error } = await supabase.rpc('add_user_balance', {
            p_user_id: userId,
            p_amount: amount,
            p_description: description || 'Deposit'
        });

        if (error) throw error;
        return data;
    }
};

// ============== SETTINGS ==============

export const SettingsAPI = {
    async get(key: string): Promise<any> {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) return null;
        return data?.value;
    },

    async getAll(): Promise<Record<string, any>> {
        const { data, error } = await supabase
            .from('settings')
            .select('key, value');

        if (error) throw error;

        const settings: Record<string, any> = {};
        (data || []).forEach((s: any) => {
            settings[s.key] = s.value;
        });
        return settings;
    },

    async set(key: string, value: any): Promise<void> {
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;
    }
};

// ============== STATS ==============

export const StatsAPI = {
    async getOverview(): Promise<any> {
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) throw error;
        return data;
    }
};

// ============== TICKETS ==============

export const TicketsAPI = {
    async getMyTickets(): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getAll(): Promise<any[]> {
        const { data, error } = await supabase
            .from('tickets')
            .select(`*, users:user_id (username, email)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(subject: string, message: string): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('tickets')
            .insert({
                user_id: user.id,
                subject,
                status: 'open',
                priority: 'normal'
            })
            .select()
            .single();

        if (error) throw error;

        // Add initial message
        await supabase.from('ticket_messages').insert({
            ticket_id: data.id,
            user_id: user.id,
            message,
            is_admin: false
        });

        return data;
    },

    async getMessages(ticketId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('ticket_messages')
            .select(`*, users:user_id (username, avatar)`)
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async addMessage(ticketId: string, message: string, isAdmin: boolean = false): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                user_id: user.id,
                message,
                is_admin: isAdmin
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStatus(ticketId: string, status: string): Promise<void> {
        const { error } = await supabase
            .from('tickets')
            .update({ status })
            .eq('id', ticketId);

        if (error) throw error;
    }
};

// ============== PRODUCT KEYS ==============

export const ProductKeysAPI = {
    async getMyKeys(): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('product_keys')
            .select(`*, products:product_id (title, type, image)`)
            .eq('user_id', user.id)
            .order('assigned_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getByProduct(productId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('product_keys')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addKeys(productId: string, keys: string[]): Promise<void> {
        const keysToInsert = keys.map(key => ({
            product_id: productId,
            key,
            status: 'available'
        }));

        const { error } = await supabase
            .from('product_keys')
            .insert(keysToInsert);

        if (error) throw error;
    }
};

// ============== REVIEWS ==============

export interface Review {
    id: string;
    productId: string;
    userId: string;
    username: string;
    avatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const ReviewsAPI = {
    async getByProduct(productId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                users:user_id (username, avatar)
            `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            userId: r.user_id,
            username: r.users?.username || 'Anonymous',
            avatar: r.users?.avatar,
            rating: r.rating,
            comment: r.comment || '',
            createdAt: r.created_at
        }));
    },

    async create(productId: string, rating: number, comment: string): Promise<Review> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                product_id: productId,
                user_id: user.id,
                rating,
                comment
            })
            .select(`*, users:user_id (username, avatar)`)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            productId: data.product_id,
            userId: data.user_id,
            username: data.users?.username || 'Anonymous',
            avatar: data.users?.avatar,
            rating: data.rating,
            comment: data.comment || '',
            createdAt: data.created_at
        };
    },

    async update(reviewId: string, rating: number, comment: string): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .update({ rating, comment, updated_at: new Date().toISOString() })
            .eq('id', reviewId);

        if (error) throw error;
    },

    async delete(reviewId: string): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;
    },

    async canReview(productId: string): Promise<{ canReview: boolean; existingReview?: Review }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { canReview: false };

        // Check if user already reviewed this product
        const { data: existingReview } = await supabase
            .from('reviews')
            .select(`*, users:user_id (username, avatar)`)
            .eq('product_id', productId)
            .eq('user_id', user.id)
            .single();

        if (existingReview) {
            return {
                canReview: false,
                existingReview: {
                    id: existingReview.id,
                    productId: existingReview.product_id,
                    userId: existingReview.user_id,
                    username: existingReview.users?.username || 'Anonymous',
                    avatar: existingReview.users?.avatar,
                    rating: existingReview.rating,
                    comment: existingReview.comment || '',
                    createdAt: existingReview.created_at
                }
            };
        }

        // Check if user has completed order for this product
        const { data: completedOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('user', user.id)
            .eq('product', productId)
            .eq('status', 'completed')
            .limit(1)
            .single();

        return { canReview: !!completedOrder };
    },

    async getMyReview(productId: string): Promise<Review | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase
            .from('reviews')
            .select(`*, users:user_id (username, avatar)`)
            .eq('product_id', productId)
            .eq('user_id', user.id)
            .single();

        if (!data) return null;

        return {
            id: data.id,
            productId: data.product_id,
            userId: data.user_id,
            username: data.users?.username || 'Anonymous',
            avatar: data.users?.avatar,
            rating: data.rating,
            comment: data.comment || '',
            createdAt: data.created_at
        };
    }
};

// ============== TRANSACTIONS ==============

export const TransactionsAPI = {
    async getMyTransactions(): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};

// ============== APP SETTINGS ==============

export const AppSettingsAPI = {
    async get(): Promise<any> {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();

        if (error) return null;
        return data;
    },

    async update(updates: Record<string, any>): Promise<void> {
        const { error } = await supabase
            .from('settings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .not('id', 'is', null); // Update the only row

        if (error) throw error;
    },

    async isReviewEnabled(): Promise<boolean> {
        const settings = await this.get();
        return settings?.review_enabled ?? true;
    },

    async setReviewEnabled(enabled: boolean): Promise<void> {
        await this.update({ review_enabled: enabled });
    }
};

// ============== WISHLIST ==============

export interface WishlistItem {
    id: string;
    productId: string;
    product: {
        id: string;
        title: string;
        price: number;
        image: string;
        type: string;
    };
    createdAt: string;
}

export const WishlistAPI = {
    async getAll(): Promise<WishlistItem[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('wishlists')
            .select(`
                id,
                product_id,
                created_at,
                products:product_id (id, title, price, image, type)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            product: {
                id: item.products?.id,
                title: item.products?.title,
                price: item.products?.price,
                image: item.products?.image,
                type: item.products?.type
            },
            createdAt: item.created_at
        }));
    },

    async add(productId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId });

        if (error && error.code !== '23505') throw error; // Ignore duplicate key error
    },

    async remove(productId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) throw error;
    },

    async isInWishlist(productId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        return !!data;
    },

    async toggle(productId: string): Promise<boolean> {
        const isInList = await this.isInWishlist(productId);
        if (isInList) {
            await this.remove(productId);
            return false;
        } else {
            await this.add(productId);
            return true;
        }
    },

    async getProductIds(): Promise<string[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', user.id);

        return (data || []).map((item: any) => item.product_id);
    }
};

// Default export for convenience
export default {
    Products: ProductsAPI,
    Orders: OrdersAPI,
    Users: UsersAPI,
    Settings: SettingsAPI,
    AppSettings: AppSettingsAPI,
    Stats: StatsAPI,
    Tickets: TicketsAPI,
    ProductKeys: ProductKeysAPI,
    Transactions: TransactionsAPI,
    Reviews: ReviewsAPI,
    Wishlist: WishlistAPI
};
