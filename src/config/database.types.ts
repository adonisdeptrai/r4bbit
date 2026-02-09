/**
 * Supabase Database Types (Generated)
 * 
 * To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/config/database.types.ts
 * Or manually update this file based on your schema
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    email: string
                    role: 'user' | 'admin' | 'seller'
                    balance: number
                    avatar_url: string | null
                    referral_code: string | null
                    referred_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    email: string
                    role?: 'user' | 'admin' | 'seller'
                    balance?: number
                    avatar_url?: string | null
                    referral_code?: string | null
                    referred_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    email?: string
                    role?: 'user' | 'admin' | 'seller'
                    balance?: number
                    avatar_url?: string | null
                    referral_code?: string | null
                    referred_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    type: 'Automation Script' | 'MMO Tool' | 'Course' | 'License Key'
                    price: number
                    original_price: number | null
                    image_url: string | null
                    features: string[]
                    rating: number
                    sales: number
                    reviews_count: number
                    stock: number | null
                    unlimited_stock: boolean
                    platform: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    type: 'Automation Script' | 'MMO Tool' | 'Course' | 'License Key'
                    price: number
                    original_price?: number | null
                    image_url?: string | null
                    features?: string[]
                    rating?: number
                    sales?: number
                    reviews_count?: number
                    stock?: number | null
                    unlimited_stock?: boolean
                    platform?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    type?: 'Automation Script' | 'MMO Tool' | 'Course' | 'License Key'
                    price?: number
                    original_price?: number | null
                    image_url?: string | null
                    features?: string[]
                    rating?: number
                    sales?: number
                    reviews_count?: number
                    stock?: number | null
                    unlimited_stock?: boolean
                    platform?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    order_id: string
                    user_id: string
                    product_id: string | null
                    product_title: string
                    amount: number
                    status: 'pending' | 'pending_verification' | 'processing' | 'paid' | 'completed' | 'refunded' | 'failed'
                    payment_method: string | null
                    payment_code: string | null
                    invoice_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string
                    user_id: string
                    product_id?: string | null
                    product_title: string
                    amount: number
                    status?: 'pending' | 'pending_verification' | 'processing' | 'paid' | 'completed' | 'refunded' | 'failed'
                    payment_method?: string | null
                    payment_code?: string | null
                    invoice_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    user_id?: string
                    product_id?: string | null
                    product_title?: string
                    amount?: number
                    status?: 'pending' | 'pending_verification' | 'processing' | 'paid' | 'completed' | 'refunded' | 'failed'
                    payment_method?: string | null
                    payment_code?: string | null
                    invoice_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_keys: {
                Row: {
                    id: string
                    product_id: string
                    key_value: string
                    is_used: boolean
                    used_by: string | null
                    used_at: string | null
                    order_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    key_value: string
                    is_used?: boolean
                    used_by?: string | null
                    used_at?: string | null
                    order_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    key_value?: string
                    is_used?: boolean
                    used_by?: string | null
                    used_at?: string | null
                    order_id?: string | null
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    product_id: string
                    user_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    user_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    user_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tickets: {
                Row: {
                    id: string
                    user_id: string
                    subject: string
                    status: 'open' | 'pending' | 'resolved' | 'closed'
                    priority: 'low' | 'medium' | 'high'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subject: string
                    status?: 'open' | 'pending' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subject?: string
                    status?: 'open' | 'pending' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high'
                    created_at?: string
                    updated_at?: string
                }
            }
            ticket_messages: {
                Row: {
                    id: string
                    ticket_id: string
                    user_id: string
                    message: string
                    is_admin: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    ticket_id: string
                    user_id: string
                    message: string
                    is_admin?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string
                    user_id?: string
                    message?: string
                    is_admin?: boolean
                    created_at?: string
                }
            }
            settings: {
                Row: {
                    key: string
                    value: Json
                    updated_at: string
                }
                Insert: {
                    key: string
                    value: Json
                    updated_at?: string
                }
                Update: {
                    key?: string
                    value?: Json
                    updated_at?: string
                }
            }
            wishlist: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    created_at?: string
                }
            }
        }
        Functions: {
            is_admin: {
                Args: Record<never, never>
                Returns: boolean
            }
            get_admin_stats: {
                Args: Record<never, never>
                Returns: Json
            }
            complete_order: {
                Args: { p_order_id: string }
                Returns: boolean
            }
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience exports
export type User = Tables<'users'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type ProductKey = Tables<'product_keys'>
export type Review = Tables<'reviews'>
export type Ticket = Tables<'tickets'>
export type TicketMessage = Tables<'ticket_messages'>
export type Setting = Tables<'settings'>
export type WishlistItem = Tables<'wishlist'>
