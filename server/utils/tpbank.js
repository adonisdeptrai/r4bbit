const axios = require('axios');
const moment = require('moment-timezone');
const https = require('https');

// HTTPS agent for SSL/TLS handling (especially in Docker/Alpine)
const httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: true,
    timeout: 30000
});

class TPBankClient {
    constructor() {
        this.token = null;
        this.cfAgent = null; // Proxy support if needed in future
    }

    async login(username, password, deviceId) {
        const data = {
            username,
            password,
            deviceId,
            transactionId: "",
        };

        const config = {
            httpsAgent,
            timeout: 30000,
            headers: {
                APP_VERSION: "2025.01.20",
                Accept: "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                Authorization: "Bearer",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Content-Type": "application/json",
                DEVICE_ID: deviceId,
                DEVICE_NAME: "Chrome",
                Origin: "https://ebank.tpb.vn",
                PLATFORM_NAME: "WEB",
                PLATFORM_VERSION: "131",
                Pragma: "no-cache",
                Referer: "https://ebank.tpb.vn/retail/vX/",
                SOURCE_APP: "HYDRO",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
            }
        };

        try {
            const response = await axios.post('https://ebank.tpb.vn/gateway/api/auth/login/v3', data, config);
            this.token = response.data.access_token;
            return response.data;
        } catch (error) {
            console.error('TPBank Login Error Details:', JSON.stringify(error.response?.data || error.message, null, 2));
            console.error('TPBank Login Error Code:', error.code || 'N/A');


            // Structured error handling
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error('TPBank connection timeout. Please try again.');
            }

            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.response.data?.error;

                if (status === 401 || status === 403) {
                    throw new Error(`Authentication failed: ${message || 'Invalid credentials'}`);
                } else if (status === 429) {
                    throw new Error('Too many requests. Please wait a moment and try again.');
                } else if (status >= 500) {
                    throw new Error(`TPBank server error (${status}). Please try again later.`);
                }

                throw new Error(message || `Login failed with status ${status}`);
            }

            throw new Error(error.message || 'TPBank login failed. Check your connection.');
        }
    }

    async getHistories(token, accountId, deviceId, username, password) {
        if (!token && !this.token) {
            // Auto-login if no token provided
            await this.login(username, password, deviceId);
            token = this.token;
        } else if (!token) {
            token = this.token;
        }

        const days = 30; // Check last 30 days
        const fromDate = moment().tz('Asia/Ho_Chi_Minh').subtract(days, 'days').format('YYYYMMDD');
        const toDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDD');

        const data = {
            pageNumber: 1,
            pageSize: 400,
            accountNo: accountId,
            currency: "VND",
            maxAcentrysrno: "",
            fromDate: fromDate,
            toDate: toDate,
            keyword: "",
        };

        const config = {
            httpsAgent,
            timeout: 30000,
            headers: {
                APP_VERSION: "2025.01.20",
                Accept: "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Content-Type": "application/json",
                DEVICE_ID: deviceId,
                DEVICE_NAME: "Chrome",
                Origin: "https://ebank.tpb.vn",
                PLATFORM_NAME: "WEB",
                PLATFORM_VERSION: "131",
                Pragma: "no-cache",
                Referer: "https://ebank.tpb.vn/retail/vX/",
                SOURCE_APP: "HYDRO",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
            }
        };

        try {
            const response = await axios.post(
                "https://ebank.tpb.vn/gateway/api/smart-search-presentation-service/v2/account-transactions/find",
                data,
                config
            );
            return response.data;
        } catch (error) {
            // Handle timeout errors
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error('TPBank request timeout. The service may be slow. Please try again.');
            }

            // Token expired - retry with re-login
            if (error.response && error.response.status === 401) {
                console.log("TPBank Token expired, re-logging in...");
                try {
                    // Re-login
                    const loginRes = await this.login(username, password, deviceId);
                    this.token = loginRes.access_token;

                    // Update config with new token
                    config.headers.Authorization = `Bearer ${this.token}`;

                    // Retry request
                    const retryRes = await axios.post(
                        "https://ebank.tpb.vn/gateway/api/smart-search-presentation-service/v2/account-transactions/find",
                        data,
                        config
                    );
                    return retryRes.data;
                } catch (loginError) {
                    console.error("TPBank Re-login failed:", loginError.message);
                    throw new Error(`Re-authentication failed: ${loginError.message}`);
                }
            }

            // Handle rate limiting
            if (error.response && error.response.status === 429) {
                throw new Error('TPBank rate limit exceeded. Please wait a moment before trying again.');
            }

            // Handle server errors
            if (error.response && error.response.status >= 500) {
                throw new Error(`TPBank server error (${error.response.status}). Service may be temporarily unavailable.`);
            }

            // Generic error with context
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            console.error('TPBank History Error:', errorMsg);
            throw new Error(`Failed to fetch transaction history: ${errorMsg}`);
        }
    }
}

module.exports = new TPBankClient();
