/**
 * API Configuration - Supabase Only
 * All backend operations now use Supabase Edge Functions
 */

// Supabase Project URL
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://okalizcwyzpwaffrkbey.supabase.co';

// Edge Functions base URL
export const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Legacy API Base URL (for backward compatibility during migration)
export const API_BASE_URL = import.meta.env.VITE_API_URL || SUPABASE_URL;

// API Endpoints - Now using Supabase Edge Functions
export const API_ENDPOINTS = {
    // Payment Edge Functions
    VERIFY_PAYMENT: `${EDGE_FUNCTIONS_URL}/verify-payment`,
    BINANCE_PAY_CREATE: `${EDGE_FUNCTIONS_URL}/binance-pay/create`,
    BINANCE_PAY_QUERY: `${EDGE_FUNCTIONS_URL}/binance-pay/query`,
    FILE_UPLOAD: `${EDGE_FUNCTIONS_URL}/file-upload`,

    // Legacy endpoints (kept for reference, should migrate to supabaseApi.ts)
    // Products - use ProductsAPI from supabaseApi.ts
    // Orders - use OrdersAPI from supabaseApi.ts  
    // Users - use UsersAPI from supabaseApi.ts
    // Settings - use SettingsAPI from supabaseApi.ts

    // Supabase Storage for static assets
    STORAGE_URL: `${SUPABASE_URL}/storage/v1/object/public`,
    PRODUCT_IMAGE: (path: string) => `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`,
    AVATAR: (path: string) => `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`,
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
