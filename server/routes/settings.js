const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { encrypt, decrypt, isEncrypted } = require('../utils/encryption');
const tpbankClient = require('../utils/tpbank');
const binanceClient = require('../utils/binance');
const binancePayClient = require('../utils/binancePay');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Helper to encrypt sensitive fields in settings
const encryptSensitiveFields = (settings) => {
    const result = { ...settings };

    // Encrypt bank password if present and not encrypted
    if (result.bank_config?.password && !isEncrypted(result.bank_config.password)) {
        result.bank_config = {
            ...result.bank_config,
            password: encrypt(result.bank_config.password)
        };
    }

    // Encrypt binance secret key if present and not encrypted
    if (result.binance_config?.secretKey && !isEncrypted(result.binance_config.secretKey)) {
        result.binance_config = {
            ...result.binance_config,
            secretKey: encrypt(result.binance_config.secretKey)
        };
    }

    return result;
};

// Helper to decrypt sensitive fields
const decryptSensitiveFields = (settings) => {
    const result = { ...settings };

    // Decrypt bank password
    if (result.bank_config?.password && isEncrypted(result.bank_config.password)) {
        result.bank_config = {
            ...result.bank_config,
            password: decrypt(result.bank_config.password)
        };
    }

    // Decrypt binance secret key
    if (result.binance_config?.secretKey && isEncrypted(result.binance_config.secretKey)) {
        result.binance_config = {
            ...result.binance_config,
            secretKey: decrypt(result.binance_config.secretKey)
        };
    }

    return result;
};

// @route   GET api/settings
// @desc    Get system settings
// @access  Public (for Checkout)
router.get('/', async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (error) throw error;

        // Decrypt before sending to client
        const decryptedSettings = decryptSensitiveFields(settings);
        res.json(decryptedSettings);
    } catch (err) {
        console.error('Get settings error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/settings
// @desc    Update system settings
// @access  Admin Only
router.put('/', auth, adminAuth, async (req, res) => {
    const { bank, exchangeRate, binance, crypto } = req.body;

    try {
        // Get current settings
        const { data: currentSettings } = await supabase
            .from('settings')
            .select('*')
            .single();

        // Build update object
        const updates = {
            ...(bank && { bank_config: bank }),
            ...(exchangeRate && { exchange_rate: exchangeRate }),
            ...(binance && { binance_config: binance }),
            ...(crypto && { crypto_config: crypto })
        };

        // Encrypt sensitive fields before saving
        const encryptedUpdates = encryptSensitiveFields(updates);

        const { data: updatedSettings, error } = await supabase
            .from('settings')
            .update(encryptedUpdates)
            .eq('id', currentSettings.id)
            .select()
            .single();

        if (error) throw error;

        // Decrypt before sending response
        const decryptedSettings = decryptSensitiveFields(updatedSettings);
        res.json(decryptedSettings);
    } catch (err) {
        console.error('Update settings error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/settings/test-tpbank
// @desc    Test TPBank Connection
// @access  Admin Only
router.post('/test-tpbank', auth, adminAuth, async (req, res) => {
    const { username, password, deviceId } = req.body;

    try {
        if (!username || !password || !deviceId) {
            return res.status(400).json({ success: false, message: 'Missing credentials' });
        }

        // Attempt login
        await tpbankClient.login(username, password, deviceId);

        res.json({ success: true, message: 'Connection Successful! Authenticated with TPBank.' });
    } catch (err) {
        console.error('TPBank Test Error:', err.message);
        const msg = err.response?.data?.message || err.message || 'Connection failed';
        res.status(400).json({ success: false, message: msg });
    }
});

// @route   GET api/settings/tpbank-logs
// @desc    Get system logs
// @access  Admin Only
router.get('/tpbank-logs', auth, adminAuth, async (req, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json(logs);
    } catch (err) {
        console.error('Get logs error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/settings/tpbank-history
// @desc    Get raw transaction history from TPBank
// @access  Admin Only
router.post('/tpbank-history', auth, adminAuth, async (req, res) => {
    try {
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.bank_config || !settings.bank_config.accountNo) {
            return res.status(400).json({ message: 'Bank settings not provided' });
        }

        // Decrypt credentials
        const decryptedSettings = decryptSensitiveFields(settings);
        const bankConfig = decryptedSettings.bank_config;

        const deviceId = bankConfig.deviceId || 'manual-check-device';

        const history = await tpbankClient.getHistories(
            null,
            bankConfig.accountNo,
            deviceId,
            bankConfig.username,
            bankConfig.password
        );

        res.json(history);
    } catch (err) {
        console.error('TPBank history error:', err.message);
        res.status(500).send({ message: 'Failed to fetch history', error: err.message });
    }
});

// ==================== BINANCE ENDPOINTS ====================

// @route   POST api/settings/test-binance
// @desc    Test Binance API Connection
// @access  Admin Only
router.post('/test-binance', auth, adminAuth, async (req, res) => {
    const { apiKey, secretKey } = req.body;

    try {
        if (!apiKey || !secretKey) {
            return res.status(400).json({ success: false, message: 'Missing API credentials' });
        }

        const result = await binanceClient.testConnection(apiKey, secretKey);
        res.json(result);
    } catch (err) {
        console.error('Binance Test Error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// @route   POST api/settings/binance-fee
// @desc    Get Binance network fee (Real-time)
// @access  Public
router.post('/binance-fee', async (req, res) => {
    try {
        const { network, currency } = req.body;
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.binance_config?.apiKey || !settings.binance_config?.secretKey) {
            return res.status(400).json({ msg: 'Binance not configured' });
        }

        // Decrypt credentials
        const decryptedSettings = decryptSensitiveFields(settings);

        const fee = await binanceClient.getNetworkFee(
            decryptedSettings.binance_config.apiKey,
            decryptedSettings.binance_config.secretKey,
            currency,
            network
        );

        res.json({ fee });
    } catch (err) {
        console.error('Binance fee error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/settings/binance-qr
// @desc    Generate Binance Pay QR Code
// @access  Public
router.post('/binance-qr', async (req, res) => {
    try {
        const { amount, currency, orderId, productName } = req.body;
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.binance_config?.apiKey || !settings.binance_config?.secretKey) {
            return res.status(400).json({ msg: 'Binance not configured' });
        }

        // Decrypt credentials
        const decryptedSettings = decryptSensitiveFields(settings);

        const result = await binancePayClient.createOrder(
            decryptedSettings.binance_config.apiKey,
            decryptedSettings.binance_config.secretKey,
            { amount, currency, orderId, productName }
        );

        res.json(result);
    } catch (err) {
        console.error('Binance Pay Route Error:', err.message);
        res.status(500).json({ msg: 'Binance Pay Error', error: err.message });
    }
});

// @route   POST api/settings/binance-history
// @desc    Get crypto transaction history from Binance
// @access  Admin Only
router.post('/binance-history', auth, adminAuth, async (req, res) => {
    try {
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.binance_config || !settings.binance_config.apiKey) {
            return res.status(400).json({ message: 'Binance API credentials not configured' });
        }

        const { type, symbol, limit, startTime, endTime } = req.body;

        // Decrypt credentials
        const decryptedSettings = decryptSensitiveFields(settings);

        let history;
        const options = { symbol, limit, startTime, endTime };

        switch (type) {
            case 'spot':
                history = await binanceClient.getSpotTransactionHistory(
                    decryptedSettings.binance_config.apiKey,
                    decryptedSettings.binance_config.secretKey,
                    options
                );
                break;
            case 'deposit':
                history = await binanceClient.getDepositHistory(
                    decryptedSettings.binance_config.apiKey,
                    decryptedSettings.binance_config.secretKey,
                    options
                );
                break;
            case 'withdraw':
                history = await binanceClient.getWithdrawHistory(
                    decryptedSettings.binance_config.apiKey,
                    decryptedSettings.binance_config.secretKey,
                    options
                );
                break;
            default:
                // Get all history types
                history = await binanceClient.getAllHistory(
                    decryptedSettings.binance_config.apiKey,
                    decryptedSettings.binance_config.secretKey,
                    options
                );
        }

        res.json(history);
    } catch (err) {
        console.error('Binance History Error:', err.message);
        res.status(500).json({ message: 'Failed to fetch Binance history', error: err.message });
    }
});

module.exports = router;
