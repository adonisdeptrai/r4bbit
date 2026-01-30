const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { PAYMENT_METHODS } = require('../constants/paymentConstants');

// Anti-spam: Rate limiting for order creation
const orderAttempts = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [userId, timestamp] of orderAttempts.entries()) {
        if (now - timestamp > 60000) { // Remove entries older than 1 minute
            orderAttempts.delete(userId);
        }
    }
}, 300000);

// Rate limit middleware: Max 1 order per 30 seconds
const rateLimitOrders = (req, res, next) => {
    const userId = req.user?.id || req.body.user;
    if (!userId) return next(); // Allow if no user ID (shouldn't happen in production)

    const now = Date.now();
    const lastAttempt = orderAttempts.get(userId);

    if (lastAttempt && (now - lastAttempt) < 30000) {
        const waitTime = Math.ceil((30000 - (now - lastAttempt)) / 1000);
        return res.status(429).json({
            message: `Anti-spam: Please wait ${waitTime} seconds before creating another order.`,
            waitTime
        });
    }

    orderAttempts.set(userId, now);
    next();
};

// GET My Orders (Protected)
router.get('/my-orders', auth, async (req, res) => {
    try {
        // Get user to retrieve username
        const { data: user } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.id)
            .single();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('username', user.username)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(orders);
    } catch (err) {
        console.error('Get my orders error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET All Orders (Admin Only)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(orders);
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// CREATE Order (with anti-spam rate limiting)
router.post('/', rateLimitOrders, async (req, res) => {
    try {
        const orderData = req.body;

        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(newOrder);
    } catch (err) {
        console.error('Order Creation Failed:', err.message);
        console.error('Payload:', req.body);
        res.status(400).json({ message: 'Error creating order', error: err.message });
    }
});

// Auto-assign key helper function
async function autoAssignKeys(orderId) {
    try {
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (!order) {
            console.error('Order not found for key assignment:', orderId);
            return;
        }

        // Find product by title
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('title', order.product_name)
            .single();

        if (!product) {
            console.log('Product not found for auto-assignment:', order.product_name);
            return;
        }

        // Only assign keys for License Key products
        if (product.type !== 'License Key') {
            console.log('Product type is not License Key, skipping auto-assignment');
            return;
        }

        // Check if keys already assigned
        const { data: existingKeys } = await supabase
            .from('product_keys')
            .select('*')
            .eq('order_id', orderId);

        if (existingKeys && existingKeys.length > 0) {
            console.log('Keys already assigned to this order');
            return;
        }

        // Find available key (FIFO - oldest first)
        const { data: availableKey } = await supabase
            .from('product_keys')
            .select('*')
            .eq('product_id', product.id)
            .eq('status', 'available')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (!availableKey) {
            console.warn(`No keys available for product: ${product.title}`);
            return { error: 'No keys available' };
        }

        // Find user by username
        const { data: user } = await supabase
            .from('users')
            .select('id, email')
            .eq('username', order.username)
            .single();

        // Assign key
        const { error: updateError } = await supabase
            .from('product_keys')
            .update({
                status: 'sold',
                order_id: orderId,
                user_id: user?.id || null,
                assigned_at: new Date().toISOString()
            })
            .eq('id', availableKey.id);

        if (updateError) throw updateError;

        console.log(`✓ Key assigned to order ${order.order_id}: ${availableKey.key}`);

        // Optional: Send email notification
        if (user && user.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const nodemailer = require('nodemailer');

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Your License Key for ${product.title}`,
                html: `
                    <h1>Order Completed!</h1>
                    <p>Hi <strong>${order.username}</strong>,</p>
                    <p>Your order <strong>${order.order_id}</strong> has been completed.</p>
                    <p>Here is your license key for <strong>${product.title}</strong>:</p>
                    <div style="background: #f0f0f0; padding: 15px; font-family: monospace; font-size: 16px; letter-spacing: 2px; border-radius: 8px; margin: 16px 0;">
                        ${availableKey.key}
                    </div>
                    <p>You can also view this key anytime in your <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/dashboard">Dashboard</a>.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">This is an automated email from R4B Platform.</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending key email:', err);
                } else {
                    console.log('License key email sent:', info.response);
                }
            });
        }

        return { success: true, key: availableKey };
    } catch (err) {
        console.error('Auto-assign keys error:', err);
        return { error: err.message };
    }
}

// Credit balance helper function (for balance top-up orders)
async function creditBalance(orderId) {
    try {
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (!order) {
            console.error('Order not found for crediting balance:', orderId);
            return;
        }

        // Only credit for balance_topup orders
        if (order.order_type !== 'balance_topup') {
            return;
        }

        // Find user
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', order.username)
            .single();

        if (!user) {
            console.error('User not found for crediting balance:', order.username);
            return;
        }

        const balanceBefore = user.balance;
        const newBalance = user.balance + order.amount;

        // Update user balance
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Create transaction record
        const { error: transError } = await supabase
            .from('transactions')
            .insert([{
                user_id: user.id,
                type: 'topup',
                amount: order.amount,
                balance_before: balanceBefore,
                balance_after: newBalance,
                description: `Balance top-up from order ${order.order_id}`,
                order_id: orderId
            }]);

        if (transError) throw transError;

        console.log(`✓ Balance credited to ${user.username}: +$${order.amount} (New balance: $${newBalance})`);

        return { success: true };
    } catch (err) {
        console.error('Credit balance error:', err);
        return { error: err.message };
    }
}

// UPDATE Order Status (Admin Only)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        // Try to find by UUID first, then by order_id
        let { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!order) {
            const { data: orderByOrderId } = await supabase
                .from('orders')
                .select('*')
                .eq('order_id', req.params.id)
                .single();
            order = orderByOrderId;
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;

        // Update order
        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({ ...(status && { status }) })
            .eq('id', order.id)
            .select()
            .single();

        if (error) throw error;

        // Auto-assign key if status changed to 'completed'
        if (status && status.toLowerCase() === 'completed' && oldStatus.toLowerCase() !== 'completed') {
            // Check order type
            if (updatedOrder.order_type === 'balance_topup') {
                // Credit balance for top-up orders
                const creditResult = await creditBalance(updatedOrder.id);
                if (creditResult && creditResult.error) {
                    console.warn(`Balance credit failed for order ${updatedOrder.order_id}:`, creditResult.error);
                }
            } else {
                // Assign key for product purchases
                const assignResult = await autoAssignKeys(updatedOrder.id);
                if (assignResult && assignResult.error) {
                    console.warn(`Key assignment failed for order ${updatedOrder.order_id}:`, assignResult.error);
                }
            }
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error('Update order error:', err);
        res.status(400).json({ message: 'Error updating order', error: err.message });
    }
});

// VERIFY Order (Admin Only)
router.put('/:id/verify', auth, adminAuth, async (req, res) => {
    try {
        let { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!order) {
            const { data: orderByOrderId } = await supabase
                .from('orders')
                .select('*')
                .eq('order_id', req.params.id)
                .single();
            order = orderByOrderId;
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;

        // Update to completed
        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({ status: 'Completed' })
            .eq('id', order.id)
            .select()
            .single();

        if (error) throw error;

        // Auto-assign key when order is completed
        if (oldStatus.toLowerCase() !== 'completed') {
            const assignResult = await autoAssignKeys(updatedOrder.id);
            if (assignResult && assignResult.error) {
                console.warn(`Key assignment failed for order ${updatedOrder.order_id}:`, assignResult.error);
            }
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error('Verify order error:', err);
        res.status(400).json({ message: 'Error verifying order', error: err.message });
    }
});

// GET Pending Bank Transfer Orders (Admin Only)
router.get('/pending', auth, adminAuth, async (req, res) => {
    try {
        const { data: pendingOrders, error } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['Pending', 'Pending Verification'])
            .ilike('payment_method', '%bank%')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(pendingOrders);
    } catch (err) {
        console.error('Get pending orders error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/orders/checkout-with-balance - Purchase with user balance (instant completion)
router.post('/checkout-with-balance', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Get user
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get product
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const totalCost = product.price * quantity;

        // Check sufficient balance
        if (user.balance < totalCost) {
            return res.status(400).json({
                message: 'Insufficient balance',
                required: totalCost,
                current: user.balance,
                shortfall: totalCost - user.balance
            });
        }

        // Deduct balance
        const balanceBefore = user.balance;
        const newBalance = user.balance - totalCost;

        const { error: balanceError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id);

        if (balanceError) throw balanceError;

        // Create order with completed status (instant)
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                username: user.username,
                product_name: product.title,
                amount: totalCost,
                status: 'completed',
                payment_method: PAYMENT_METHODS.BALANCE,
                order_type: 'product_purchase'
            }])
            .select()
            .single();

        if (orderError) {
            // Rollback balance on order creation failure
            await supabase
                .from('users')
                .update({ balance: balanceBefore })
                .eq('id', user.id);
            throw orderError;
        }

        // Create transaction record
        const { error: transError } = await supabase
            .from('transactions')
            .insert([{
                user_id: user.id,
                type: 'purchase',
                amount: -totalCost,
                balance_before: balanceBefore,
                balance_after: newBalance,
                description: `Purchase: ${product.title}`,
                order_id: order.id
            }]);

        if (transError) console.error('Transaction creation error:', transError);

        // Auto-assign key if applicable
        if (product.type === 'License Key') {
            const assignResult = await autoAssignKeys(order.id);
            if (assignResult && assignResult.error) {
                console.warn(`Key assignment failed for balance purchase ${order.order_id}:`, assignResult.error);
            }
        }

        res.json({
            message: 'Purchase successful!',
            order,
            newBalance
        });
    } catch (err) {
        console.error('Checkout with Balance Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// MANUAL VERIFY Payment (Admin Only)
router.post('/:orderId/manual-verify', auth, adminAuth, async (req, res) => {
    const { transactionId, note, receivedAmount } = req.body;
    const { orderId } = req.params;

    try {
        // Find order by order_id field (not UUID)
        let { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .single();

        // Fallback to UUID if not found
        if (!order) {
            const { data: orderById } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();
            order = orderById;
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'Completed') {
            return res.status(400).json({ message: 'Order already completed' });
        }

        // Update order với manual verification
        const manualVerifyData = {
            verified: true,
            verifiedBy: req.user.username,
            verifiedAt: new Date().toISOString(),
            transactionId: transactionId || 'N/A',
            note: note || '',
            receivedAmount: receivedAmount || order.amount
        };

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({
                status: 'Completed',
                verified_at: new Date().toISOString(),
                manual_verify: manualVerifyData
            })
            .eq('id', order.id)
            .select()
            .single();

        if (error) throw error;

        // Log to system
        await supabase
            .from('system_logs')
            .insert([{
                type: 'MANUAL_VERIFY',
                message: `Admin manually verified Order ${order.order_id}`,
                source: 'Payment Verification',
                details: {
                    orderId: order.order_id,
                    adminUser: req.user.username,
                    note,
                    expectedAmount: order.amount,
                    receivedAmount: receivedAmount || order.amount,
                    difference: (receivedAmount || order.amount) - order.amount,
                    transactionId: transactionId || 'N/A'
                }
            }]);

        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        console.error('Manual verify error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
