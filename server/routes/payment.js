const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');
const { decrypt, isEncrypted } = require('../utils/encryption');
const binancePay = require('../utils/binancePay');

// @route   POST /api/payment/binance/create
// @desc    Create Binance Pay Order
// @access  Private
router.post('/binance/create', auth, async (req, res) => {
    try {
        const { amount, orderId, productName } = req.body;
        const userId = req.user.id; // From auth middleware

        // 1. Get Binance Keys from Settings
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.binance_config?.apiKey || !settings.binance_config?.secretKey) {
            return res.status(400).json({ success: false, message: 'Binance Pay not configured' });
        }

        // Decrypt credentials if encrypted
        let secretKey = settings.binance_config.secretKey;
        if (isEncrypted(secretKey)) {
            secretKey = decrypt(secretKey);
        }

        // 2. Create Order Payload
        const orderData = {
            orderId: orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount: amount, // Must be numeric/string
            currency: 'USDT', // Force USDT as per request context
            productName: productName || 'Top Up Balance',
            goodsCategory: 'D000'
        };

        // 3. Call Binance API
        const result = await binancePay.createOrder(
            settings.binance_config.apiKey,
            secretKey,
            orderData
        );

        // 4. Return QR Info
        res.json({
            success: true,
            data: {
                prepayId: result.prepayId,
                qrCodeUrl: result.qrcodeLink, // Dynamic QR Link
                universalUrl: result.universalUrl, // Deep link for mobile
                orderId: orderData.orderId
            }
        });

    } catch (error) {
        console.error('Binance Create Order Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/payment/binance/query/:orderId
// @desc    Check Order Status
// @access  Private
router.get('/binance/query/:orderId', auth, async (req, res) => {
    try {
        const { orderId } = req.params;

        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.binance_config?.apiKey) {
            return res.status(400).json({ success: false, message: 'Config Missing' });
        }

        // Decrypt credentials if encrypted
        let secretKey = settings.binance_config.secretKey;
        if (isEncrypted(secretKey)) {
            secretKey = decrypt(secretKey);
        }

        const result = await binancePay.queryOrder(
            settings.binance_config.apiKey,
            secretKey,
            orderId
        );

        res.json({
            success: true,
            status: result.status, // PAID, PENDING, EXPIRED, etc.
            data: result
        });

    } catch (error) {
        // Don't log spammy errors during polling if it's just 'not found' yet
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
