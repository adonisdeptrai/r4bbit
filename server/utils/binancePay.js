const crypto = require('crypto');
const axios = require('axios');

class BinancePayClient {
    constructor() {
        this.baseUrl = 'https://bpay.binanceapi.com';
    }

    /**
     * Generate Random String (Nonce)
     */
    generateNonce(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Create Signature
     */
    sign(payload, timestamp, nonce, secretKey) {
        const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;
        const dataToSign = `${timestamp}\n${nonce}\n${payloadStr}\n`;
        return crypto
            .createHmac('sha512', secretKey)
            .update(dataToSign)
            .digest('hex')
            .toUpperCase();
    }

    /**
     * Create Order (Generate QR)
     */
    async createOrder(apiKey, secretKey, orderData) {
        const endpoint = '/binancepay/openapi/v2/order';
        const url = `${this.baseUrl}${endpoint}`;

        const timestamp = Date.now().toString();
        const nonce = this.generateNonce();

        // Ensure decimal string for amount
        const amountStr = parseFloat(orderData.amount).toFixed(2);

        const payloadObj = {
            env: {
                terminalType: 'WEB'
            },
            merchantTradeNo: orderData.orderId,
            orderAmount: parseFloat(amountStr),
            currency: orderData.currency,
            goods: {
                goodsType: '01',
                goodsCategory: 'D000',
                referenceGoodsId: orderData.productId || 'REF001',
                goodsName: orderData.productName || 'Digital Product'
            }
        };

        // CRITICAL: Stringify once to ensure signature matches the exact body sent
        const payloadStr = JSON.stringify(payloadObj);
        const signature = this.sign(payloadStr, timestamp, nonce, secretKey);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': timestamp,
                'BinancePay-Nonce': nonce,
                'BinancePay-Certificate-SN': apiKey,
                'BinancePay-Signature': signature
            };

            const response = await axios.post(url, payloadStr, { headers });

            if (response.data.status === 'SUCCESS') {
                return response.data.data;
            } else {
                throw new Error(response.data.errorMessage || 'Binance Pay API Error: ' + JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Binance Pay Request Error:', error.response?.data || error.message);
            // Throw more detailed error
            const detail = error.response?.data?.errorMessage || error.response?.data?.msg || error.message;
            throw new Error(detail);
        }
    }

    /**
     * Query Order Status
     */
    async queryOrder(apiKey, secretKey, merchantTradeNo) {
        const endpoint = '/binancepay/openapi/v2/order/query';
        const url = `${this.baseUrl}${endpoint}`;

        const timestamp = Date.now().toString();
        const nonce = this.generateNonce();

        const payloadObj = {
            merchantTradeNo
        };

        const payloadStr = JSON.stringify(payloadObj);
        const signature = this.sign(payloadStr, timestamp, nonce, secretKey);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': timestamp,
                'BinancePay-Nonce': nonce,
                'BinancePay-Certificate-SN': apiKey,
                'BinancePay-Signature': signature
            };

            const response = await axios.post(url, payloadStr, { headers });

            if (response.data.status === 'SUCCESS') {
                return response.data.data;
            } else {
                throw new Error(response.data.errorMessage || 'Binance Pay Query Error');
            }
        } catch (error) {
            const detail = error.response?.data?.errorMessage || error.message;
            throw new Error(detail);
        }
    }
}

module.exports = new BinancePayClient();
