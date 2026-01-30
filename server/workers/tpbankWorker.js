const supabase = require('../config/supabase');
const tpbankClient = require('../utils/tpbank');

const CHECK_INTERVAL = 60 * 1000; // 60 seconds

// Helper to log to DB and Console
async function logEvent(type, message, details = null) {
    console.log(`[TPBank Worker] [${type}] ${message}`);
    try {
        await supabase
            .from('system_logs')
            .insert([{
                type,
                message,
                details,
                source: 'TPBank Worker'
            }]);
    } catch (e) {
        console.error('Failed to write system log:', e.message);
    }
}

async function checkTransactions() {
    try {
        // 1. Get Settings
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.bank_config || !settings.bank_config.username || !settings.bank_config.password || !settings.bank_config.accountNo) {
            // Only log warning once every 10 checks or just silence to avoid spam
            // For now silent return to avoid spamming logs if unconfigured.
            return;
        }

        if (settings.is_auto_check_enabled === false) {
            // Worker is disabled by user
            return;
        }

        // 2. Get Pending Orders
        const { data: pendingOrders } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['Pending', 'Pending Verification']);

        if (!pendingOrders || pendingOrders.length === 0) {
            return;
        }

        await logEvent('WORKER', `Checking bank for ${pendingOrders.length} pending orders...`);

        // 3. Fetch Bank History
        const deviceId = settings.bank_config.deviceId || 'server-worker-device-id';
        let history;
        try {
            history = await tpbankClient.getHistories(
                null,
                settings.bank_config.accountNo,
                deviceId,
                settings.bank_config.username,
                settings.bank_config.password
            );
        } catch (apiError) {
            await logEvent('ERROR', 'Failed to fetch TPBank history', { error: apiError.message });
            return;
        }

        if (!history || !history.transactionInfos) {
            return;
        }

        // 4. Match Orders with STRICT validation
        let matchCount = 0;
        for (const order of pendingOrders) {
            // Extract order code (remove # prefix)
            const orderCode = order.order_id.replace('#', '').toUpperCase();

            const match = history.transactionInfos.find(t => {
                const desc = (t.description || '').toUpperCase();
                const txAmount = parseFloat(t.amount);
                const orderAmount = parseFloat(order.amount);

                // STRICT VALIDATION:
                // 1. Description must contain EXACT order code
                const hasOrderCode = desc.includes(orderCode);

                // 2. Amount must match EXACTLY (no tolerance)
                const isExactAmount = txAmount === orderAmount;

                // 3. Must be CREDIT transaction (money IN)
                const isCredit = t.creditDebitIndicator === 'CRDT';

                return hasOrderCode && isExactAmount && isCredit;
            });

            if (match) {
                await logEvent('SUCCESS', `Payment verified for Order ${order.order_id}`, {
                    orderId: order.order_id,
                    transactionId: match.id || match.transactionId,
                    amount: match.amount,
                    expectedAmount: order.amount,
                    description: match.description
                });

                // Update order status
                await supabase
                    .from('orders')
                    .update({
                        status: 'Completed',
                        verified_at: new Date().toISOString()
                    })
                    .eq('id', order.id);

                matchCount++;
            } else {
                // Check if there's a partial match for logging
                const partialMatch = history.transactionInfos.find(t => {
                    const desc = (t.description || '').toUpperCase();
                    return desc.includes(orderCode);
                });

                if (partialMatch) {
                    await logEvent('WARNING', `Partial match found but validation failed for Order ${order.order_id}`, {
                        orderId: order.order_id,
                        expectedAmount: order.amount,
                        receivedAmount: partialMatch.amount,
                        difference: partialMatch.amount - order.amount,
                        description: partialMatch.description,
                        reason: partialMatch.amount !== order.amount ? 'Amount mismatch' : 'Not credit transaction'
                    });
                }
            }
        }

        if (matchCount > 0) {
            await logEvent('INFO', `Batch complete. Verified ${matchCount} orders.`);
        }

    } catch (err) {
        await logEvent('ERROR', 'Worker Process Error', { error: err.message });
    }
}

function startWorker() {
    logEvent('WORKER', 'TPBank Background Service Started');
    checkTransactions();
    setInterval(checkTransactions, CHECK_INTERVAL);
}

module.exports = { startWorker };
