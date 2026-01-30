const Binance = require('binance-api-node').default;

class BinanceClient {
    constructor() {
        this.client = null;
    }

    /**
     * Initialize Binance client with API credentials
     */
    initClient(apiKey, secretKey) {
        this.client = Binance({
            apiKey: apiKey,
            apiSecret: secretKey,
            useServerTime: true,
            recvWindow: 60000
        });
        return this.client;
    }

    /**
     * Get Spot Trading History (Recent Trades)
     * @param {string} apiKey - Binance API Key
     * @param {string} secretKey - Binance Secret Key
     * @param {object} options - { symbol: 'BTCUSDT', limit: 500, startTime, endTime }
     * @returns {Promise<Array>} Array of trade transactions
     */
    async getSpotTransactionHistory(apiKey, secretKey, options = {}) {
        try {
            const client = this.initClient(apiKey, secretKey);

            const { symbol = '', limit = 500, startTime, endTime } = options;

            // If no symbol specified, get all trades from account
            // If no symbol specified, throw error (Binance API requires symbol for myTrades)
            if (!symbol) {
                // Alternatively, we could default to 'BTCUSDT' or return empty, but better to be explicit
                throw new Error('Symbol is required for Spot Transaction History (e.g. BTCUSDT)');
            } else {
                // Get trades for specific symbol
                const trades = await client.myTrades({
                    symbol: symbol,
                    limit: limit,
                    ...(startTime && { startTime }),
                    ...(endTime && { endTime })
                });
                return this.formatSpotTrades(trades);
            }
        } catch (error) {
            console.error('Binance Spot History Error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get Deposit History
     * @param {string} apiKey 
     * @param {string} secretKey 
     * @param {object} options - { coin: 'BTC', status: 1, limit: 1000, startTime, endTime }
     * @returns {Promise<Array>}
     */
    async getDepositHistory(apiKey, secretKey, options = {}) {
        try {
            const client = this.initClient(apiKey, secretKey);

            const { coin, status, limit = 1000, startTime, endTime } = options;

            const params = {
                ...(coin && { coin }),
                ...(status !== undefined && { status }),
                ...(limit && { limit }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime })
            };

            const result = await client.depositHistory(params);
            return this.formatDepositHistory(result);
        } catch (error) {
            console.error('Binance Deposit History Error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get Withdrawal History
     * @param {string} apiKey 
     * @param {string} secretKey 
     * @param {object} options - { coin: 'BTC', status: 6, limit: 1000, startTime, endTime }
     * @returns {Promise<Array>}
     */
    async getWithdrawHistory(apiKey, secretKey, options = {}) {
        try {
            const client = this.initClient(apiKey, secretKey);

            const { coin, status, limit = 1000, startTime, endTime } = options;

            const params = {
                ...(coin && { coin }),
                ...(status !== undefined && { status }),
                ...(limit && { limit }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime })
            };

            const result = await client.withdrawHistory(params);
            return this.formatWithdrawHistory(result);
        } catch (error) {
            console.error('Binance Withdraw History Error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get All History (Combined)
     * Fetches Spot, Deposits, and Withdrawals together
     */
    async getAllHistory(apiKey, secretKey, options = {}) {
        try {
            const [spot, deposits, withdrawals] = await Promise.all([
                this.getSpotTransactionHistory(apiKey, secretKey, options).catch(e => {
                    console.error('Spot fetch failed:', e.message);
                    return [];
                }),
                this.getDepositHistory(apiKey, secretKey, options).catch(e => {
                    console.error('Deposit fetch failed:', e.message);
                    return [];
                }),
                this.getWithdrawHistory(apiKey, secretKey, options).catch(e => {
                    console.error('Withdraw fetch failed:', e.message);
                    return [];
                })
            ]);

            return {
                spot,
                deposits,
                withdrawals,
                combined: [...spot, ...deposits, ...withdrawals].sort((a, b) => b.timestamp - a.timestamp)
            };
        } catch (error) {
            console.error('Binance All History Error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get Withdrawal Fee for specific Asset and Network
     */
    async getWithdrawalFee(apiKey, secretKey, asset, network) {
        try {
            const client = this.initClient(apiKey, secretKey);

            // Get all coin info (requires authentication)
            // Note: binance-api-node might expose this as capitalConfigGetall or similar
            // If not available directly, we might need to check library docs or use raw request if supported
            // Creating a safe fallback or specific method

            const coins = await client.capitalConfigGetall();

            const coinData = coins.find(c => c.coin === asset);
            if (!coinData) {
                throw new Error(`Asset ${asset} not found in Binance`);
            }

            const networkData = coinData.networkList.find(n => n.network === network);
            if (!networkData) {
                // Try fuzzy match or default if exact network code differs (e.g. TRX vs TRC20)
                // Binance usually uses 'TRX' for TRC20 network code in some contexts, but 'TRX' is the network for Tron
                // User inputs: TRC20, ERC20, BEP20, SOL, BTC
                // Binance Network Codes: TRX, ETH, BSC, SOL, BTC
                const networkMap = {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                    'SOL': 'SOL',
                    'BTC': 'BTC'
                };
                const mappedNetwork = networkMap[network] || network;
                const fuzzyNet = coinData.networkList.find(n => n.network === mappedNetwork);

                if (!fuzzyNet) throw new Error(`Network ${network} not supported for ${asset}`);
                return fuzzyNet.withdrawFee;
            }

            return networkData.withdrawFee;
        } catch (error) {
            console.error('Fetch Fee Error:', error.message);
            // Fallback to default manual entry if API fails? 
            // Better to throw so frontend knows to keep manual or show error
            throw this.handleError(error);
        }
    }

    /**
     * Test API Connection
     */
    async testConnection(apiKey, secretKey) {
        try {
            const client = this.initClient(apiKey, secretKey);

            // Test with account info endpoint
            const accountInfo = await client.accountInfo();

            return {
                success: true,
                message: 'Connection successful!',
                canTrade: accountInfo.canTrade,
                canWithdraw: accountInfo.canWithdraw,
                canDeposit: accountInfo.canDeposit,
                balances: accountInfo.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0).length
            };
        } catch (error) {
            console.error('Binance Test Connection Error:', error.message);
            throw this.handleError(error);
        }
    }

    // --- Formatters ---

    formatSpotTrades(trades) {
        if (!trades || trades.length === 0) return [];

        return trades.map(trade => ({
            id: trade.id,
            symbol: trade.symbol,
            type: 'spot',
            side: trade.isBuyer ? 'BUY' : 'SELL',
            price: parseFloat(trade.price),
            quantity: parseFloat(trade.qty),
            quoteQuantity: parseFloat(trade.quoteQty),
            commission: parseFloat(trade.commission),
            commissionAsset: trade.commissionAsset,
            timestamp: trade.time,
            date: new Date(trade.time).toISOString(),
            isBuyer: trade.isBuyer,
            isMaker: trade.isMaker
        }));
    }

    formatDepositHistory(deposits) {
        if (!deposits || deposits.length === 0) return [];

        return deposits.map(deposit => ({
            id: deposit.txId,
            coin: deposit.coin,
            type: 'deposit',
            amount: parseFloat(deposit.amount),
            network: deposit.network,
            address: deposit.address,
            addressTag: deposit.addressTag,
            status: this.getDepositStatus(deposit.status),
            timestamp: deposit.insertTime,
            date: new Date(deposit.insertTime).toISOString()
        }));
    }

    formatWithdrawHistory(withdrawals) {
        if (!withdrawals || withdrawals.length === 0) return [];

        return withdrawals.map(withdrawal => ({
            id: withdrawal.id,
            coin: withdrawal.coin,
            type: 'withdraw',
            amount: parseFloat(withdrawal.amount),
            transactionFee: parseFloat(withdrawal.transactionFee),
            network: withdrawal.network,
            address: withdrawal.address,
            addressTag: withdrawal.addressTag,
            txId: withdrawal.txId,
            status: this.getWithdrawStatus(withdrawal.status),
            timestamp: withdrawal.applyTime,
            date: new Date(withdrawal.applyTime).toISOString()
        }));
    }

    // --- Status Helpers ---

    getDepositStatus(code) {
        const statuses = {
            0: 'Pending',
            1: 'Success',
            6: 'Credited but cannot withdraw'
        };
        return statuses[code] || `Unknown (${code})`;
    }

    getWithdrawStatus(code) {
        const statuses = {
            0: 'Email Sent',
            1: 'Cancelled',
            2: 'Awaiting Approval',
            3: 'Rejected',
            4: 'Processing',
            5: 'Failure',
            6: 'Completed'
        };
        return statuses[code] || `Unknown (${code})`;
    }

    // --- Error Handler ---

    handleError(error) {
        let message = error.message || 'Unknown error';

        // Binance-specific error codes
        if (error.code) {
            const errorMap = {
                '-1021': 'Timestamp for this request is outside of the recvWindow',
                '-1022': 'Signature for this request is not valid',
                '-2014': 'API-key format invalid',
                '-2015': 'Invalid API-key, IP, or permissions for action'
            };

            if (errorMap[error.code]) {
                message = errorMap[error.code];
            }
        }

        const err = new Error(message);
        err.code = error.code;
        return err;
    }
}

module.exports = new BinanceClient();
