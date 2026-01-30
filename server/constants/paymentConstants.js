/**
 * Payment Method Constants
 * Centralized definition of payment method strings to ensure consistency
 */

const PAYMENT_METHODS = {
    CRYPTO: 'Crypto (USDT)',
    BANK_TRANSFER: 'Bank Transfer',
    BALANCE: 'Balance Payment',
    BINANCE_PAY: 'Binance Pay'
};

// Order status constants
const ORDER_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    PROCESSING: 'processing',
    PAID: 'paid',
    REFUNDED: 'refunded',
    PENDING_VERIFICATION: 'pending_verification',
    FAILED: 'failed'
};

// Order types
const ORDER_TYPES = {
    PRODUCT_PURCHASE: 'product_purchase',
    BALANCE_TOPUP: 'balance_topup'
};

module.exports = {
    PAYMENT_METHODS,
    ORDER_STATUS,
    ORDER_TYPES
};
