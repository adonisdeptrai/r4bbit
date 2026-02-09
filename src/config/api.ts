/**
 * API Configuration - Supabase Only with Legacy Support
 * Edge Functions for server-side logic, direct Supabase client for data operations
 */

// Supabase Project URL
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://okalizcwyzpwaffrkbey.supabase.co';

// Edge Functions base URL
export const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Legacy API Base URL (for backward compatibility during migration)
export const API_BASE_URL = import.meta.env.VITE_API_URL || SUPABASE_URL;

// Storage URLs
export const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

// API Endpoints
export const API_ENDPOINTS = {
    // === NEW: Supabase Edge Functions ===
    VERIFY_PAYMENT: `${EDGE_FUNCTIONS_URL}/verify-payment`,
    BINANCE_PAY_CREATE: `${EDGE_FUNCTIONS_URL}/binance-pay/create`,
    BINANCE_PAY_QUERY: `${EDGE_FUNCTIONS_URL}/binance-pay/query`,
    FILE_UPLOAD: `${EDGE_FUNCTIONS_URL}/file-upload`,

    // === Storage ===
    STORAGE_URL: `${SUPABASE_URL}/storage/v1/object/public`,
    PRODUCT_IMAGE: (path: string) => `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`,
    AVATAR: (path: string) => `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`,

    // === LEGACY: Express-style endpoints (use supabaseApi.ts instead) ===
    // These are kept for backward compatibility during migration
    // TODO: Migrate all usages to supabaseApi.ts functions

    // Products (DEPRECATED - use ProductsAPI from supabaseApi.ts)
    PRODUCTS: `${API_BASE_URL}/api/products`,
    PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/api/products/${id}`,

    // Orders (DEPRECATED - use OrdersAPI from supabaseApi.ts)
    ORDERS: `${API_BASE_URL}/api/orders`,
    ORDERS_MY: `${API_BASE_URL}/api/orders/my-orders`,
    ORDERS_PENDING: `${API_BASE_URL}/api/orders/pending`,
    ORDER_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    ORDER_VERIFY: (id: string) => `${API_BASE_URL}/api/orders/${id}/verify`,
    ORDER_MANUAL_VERIFY: (id: string) => `${API_BASE_URL}/api/orders/${id}/manual-verify`,

    // Users (DEPRECATED - use UsersAPI from supabaseApi.ts)
    USERS: `${API_BASE_URL}/api/users`,
    USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,

    // Settings (DEPRECATED - use SettingsAPI from supabaseApi.ts)
    SETTINGS: `${API_BASE_URL}/api/settings`,
    SETTINGS_TEST_TPBANK: `${API_BASE_URL}/api/settings/test-tpbank`,
    SETTINGS_TEST_BINANCE: `${API_BASE_URL}/api/settings/test-binance`,
    SETTINGS_TPBANK_HISTORY: `${API_BASE_URL}/api/settings/tpbank-history`,
    SETTINGS_TPBANK_LOGS: `${API_BASE_URL}/api/settings/tpbank-logs`,
    SETTINGS_BINANCE_HISTORY: `${API_BASE_URL}/api/settings/binance-history`,

    // Stats (DEPRECATED - use StatsAPI from supabaseApi.ts)
    STATS_OVERVIEW: `${API_BASE_URL}/api/stats/overview`,

    // Upload (DEPRECATED - use FILE_UPLOAD edge function)
    UPLOAD: `${EDGE_FUNCTIONS_URL}/file-upload`,

    // Legacy static assets
    UPLOADS: (path: string) => `${STORAGE_URL}/product-images/${path}`,
} as const;

// Helper to call Edge Functions with auth
export async function callEdgeFunction(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem('token');

    return fetch(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
}

export default API_BASE_URL;
