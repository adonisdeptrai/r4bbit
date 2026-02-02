// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH_RESET_PASSWORD: (token: string) => `${API_BASE_URL}/api/auth/reset-password/${token}`,
    AUTH_VERIFY_PAYMENT: `${API_BASE_URL}/api/auth/verify-payment`,

    // Products
    PRODUCTS: `${API_BASE_URL}/api/products`,
    PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/api/products/${id}`,

    // Orders
    ORDERS: `${API_BASE_URL}/api/orders`,
    ORDERS_MY: `${API_BASE_URL}/api/orders/my-orders`,
    ORDERS_PENDING: `${API_BASE_URL}/api/orders/pending`,
    ORDER_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    ORDER_VERIFY: (id: string) => `${API_BASE_URL}/api/orders/${id}/verify`,
    ORDER_MANUAL_VERIFY: (id: string) => `${API_BASE_URL}/api/orders/${id}/manual-verify`,

    // Settings
    SETTINGS: `${API_BASE_URL}/api/settings`,
    SETTINGS_TEST_TPBANK: `${API_BASE_URL}/api/settings/test-tpbank`,
    SETTINGS_TEST_BINANCE: `${API_BASE_URL}/api/settings/test-binance`,
    SETTINGS_TPBANK_HISTORY: `${API_BASE_URL}/api/settings/tpbank-history`,
    SETTINGS_TPBANK_LOGS: `${API_BASE_URL}/api/settings/tpbank-logs`,
    SETTINGS_BINANCE_HISTORY: `${API_BASE_URL}/api/settings/binance-history`,

    // Users
    USERS: `${API_BASE_URL}/api/users`,
    USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,

    // Stats
    STATS_OVERVIEW: `${API_BASE_URL}/api/stats/overview`,

    // Upload
    UPLOAD: `${API_BASE_URL}/api/upload`,

    // Payment
    PAYMENT_BINANCE_CREATE: `${API_BASE_URL}/api/payment/binance/create`,
    PAYMENT_BINANCE_QUERY: (orderId: string) => `${API_BASE_URL}/api/payment/binance/query/${orderId}`,

    // Static Assets
    UPLOADS: (path: string) => `${API_BASE_URL}${path}`,
} as const;

export default API_BASE_URL;
