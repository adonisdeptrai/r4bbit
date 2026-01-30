const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET /api/keys - List keys with filters (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const { productId, status, page = 1, limit = 50 } = req.query;

        let query = supabase
            .from('product_keys')
            .select(`
                *,
                products:product_id(id, title, type),
                orders:order_id(id, order_id),
                users:user_id(id, username, email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

        if (productId) query = query.eq('product_id', productId);
        if (status) query = query.eq('status', status);

        const { data: keys, error, count } = await query;

        if (error) throw error;

        res.json({
            keys,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (err) {
        console.error('Get Keys Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/keys - Bulk add keys (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
    try {
        const { productId, keys } = req.body;

        if (!productId || !keys || !Array.isArray(keys) || keys.length === 0) {
            return res.status(400).json({ message: 'Product ID and keys array are required' });
        }

        // Verify product exists
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Filter empty keys and trim whitespace
        const validKeys = keys
            .filter(k => k && k.trim())
            .map(k => k.trim());

        if (validKeys.length === 0) {
            return res.status(400).json({ message: 'No valid keys provided' });
        }

        // Check for duplicates in DB
        const { data: existingKeys } = await supabase
            .from('product_keys')
            .select('key')
            .in('key', validKeys);

        const existingKeyStrings = existingKeys ? existingKeys.map(k => k.key) : [];
        const newKeys = validKeys.filter(k => !existingKeyStrings.includes(k));

        if (newKeys.length === 0) {
            return res.status(400).json({
                message: 'All keys already exist in database',
                duplicates: existingKeyStrings.length
            });
        }

        // Create ProductKey documents
        const keyDocs = newKeys.map(key => ({
            product_id: productId,
            key,
            status: 'available'
        }));

        const { data: createdKeys, error } = await supabase
            .from('product_keys')
            .insert(keyDocs)
            .select();

        if (error) throw error;

        res.status(201).json({
            message: `Successfully added ${createdKeys.length} keys`,
            added: createdKeys.length,
            duplicates: existingKeyStrings.length,
            keys: createdKeys
        });
    } catch (err) {
        console.error('Add Keys Error:', err);
        if (err.code === '23505') {
            // Duplicate key error (Postgres)
            return res.status(400).json({ message: 'Duplicate key detected' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/keys/:id - Delete a key (Admin only, only if available)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { id } = req.params;

        const { data: key } = await supabase
            .from('product_keys')
            .select('*')
            .eq('id', id)
            .single();

        if (!key) {
            return res.status(404).json({ message: 'Key not found' });
        }

        if (key.status !== 'available') {
            return res.status(400).json({
                message: `Cannot delete ${key.status} key. Only available keys can be deleted.`
            });
        }

        const { error } = await supabase
            .from('product_keys')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Key deleted successfully' });
    } catch (err) {
        console.error('Delete Key Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/keys/assigned/:orderId - Get keys for an order (User or Admin)
router.get('/assigned/:orderId', auth, async (req, res) => {
    try {
        const { orderId } = req.params;

        const { data: order } = await supabase
            .from('orders')
            .select('id, username')
            .eq('id', orderId)
            .single();

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization: User can only see their own orders, admin can see all
        const { data: user } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.id)
            .single();

        if (req.user.role !== 'admin' && order.username !== user.username) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { data: keys } = await supabase
            .from('product_keys')
            .select('*')
            .eq('order_id', orderId);

        res.json({ keys: keys || [] });
    } catch (err) {
        console.error('Get Assigned Keys Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/keys/assign - Manually assign key to order (Admin only)
router.post('/assign', [auth, adminAuth], async (req, res) => {
    try {
        const { orderId, keyId } = req.body;

        if (!orderId || !keyId) {
            return res.status(400).json({ message: 'Order ID and Key ID are required' });
        }

        // Find order and key
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        const { data: key } = await supabase
            .from('product_keys')
            .select('*')
            .eq('id', keyId)
            .single();

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!key) return res.status(404).json({ message: 'Key not found' });

        if (key.status !== 'available') {
            return res.status(400).json({ message: `Key is already ${key.status}` });
        }

        // Get user ID from username
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('username', order.username)
            .single();

        // Assign key
        const { data: assignedKey, error } = await supabase
            .from('product_keys')
            .update({
                status: 'sold',
                order_id: orderId,
                user_id: user?.id || null,
                assigned_at: new Date().toISOString()
            })
            .eq('id', keyId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Key assigned successfully',
            key: {
                id: assignedKey.id,
                key: assignedKey.key,
                assigned_at: assignedKey.assigned_at
            }
        });
    } catch (err) {
        console.error('Assign Key Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
