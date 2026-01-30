const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { PAYMENT_METHODS } = require('../constants/paymentConstants');

// GET /api/balance/my-balance - Get current balance and recent transactions
router.get('/my-balance', auth, async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('username, balance')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get recent 5 transactions
        const { data: recentTransactions } = await supabase
            .from('transactions')
            .select(`
                *,
                orders:order_id(order_id),
                created_by_users:created_by(username)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            balance: user.balance,
            username: user.username,
            recentTransactions
        });
    } catch (err) {
        console.error('Get Balance Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/balance/topup - Create a balance top-up order
router.post('/topup', auth, async (req, res) => {
    try {
        const { amount, method = PAYMENT_METHODS.CRYPTO } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid topup amount' });
        }

        const { data: user } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create deposit order
        const { data: order, error } = await supabase
            .from('orders')
            .insert([{
                username: user.username,
                product_name: `Balance Top-Up ($${amount})`,
                amount: parseFloat(amount),
                status: 'pending',
                payment_method: method,
                order_type: 'balance_topup'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Top-up order created. Please complete payment.',
            order
        });
    } catch (err) {
        console.error('Top-up Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/balance/transactions - Get transaction history
router.get('/transactions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { data: transactions, error, count } = await supabase
            .from('transactions')
            .select(`
                *,
                orders:order_id(order_id),
                created_by_users:created_by(username)
            `, { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

        if (error) throw error;

        res.json({
            transactions,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (err) {
        console.error('Get Transactions Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/balance/adjust - Admin balance adjustment
router.post('/adjust', [auth, adminAuth], async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;

        if (!userId || !amount || !reason) {
            return res.status(400).json({
                message: 'User ID, amount, and reason are required'
            });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balanceBefore = user.balance;
        const adjustAmount = parseFloat(amount);

        let newBalance = user.balance + adjustAmount;

        // Prevent negative balance
        if (newBalance < 0) {
            newBalance = 0;
        }

        // Update user balance
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Create transaction record
        const { data: transaction, error: transError } = await supabase
            .from('transactions')
            .insert([{
                user_id: userId,
                type: 'admin_adjustment',
                amount: adjustAmount,
                balance_before: balanceBefore,
                balance_after: newBalance,
                description: `Admin adjustment: ${reason}`,
                created_by: req.user.id
            }])
            .select()
            .single();

        if (transError) throw transError;

        res.json({
            message: 'Balance adjusted successfully',
            user: {
                username: user.username,
                balance: newBalance
            },
            transaction
        });
    } catch (err) {
        console.error('Balance Adjust Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
