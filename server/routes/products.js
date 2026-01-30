const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auth Middleware
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Helper to parse body fields that might be strings/JSON
const parseBody = (body) => {
    const data = { ...body };
    if (typeof data.features === 'string') {
        try {
            data.features = JSON.parse(data.features);
        } catch (e) {
            data.features = data.features.split(',').map(f => f.trim()).filter(f => f);
        }
    }
    if (data.price) data.price = Number(data.price);
    if (data.originalPrice) data.original_price = Number(data.originalPrice);
    if (data.stock) data.stock = Number(data.stock);
    if (data.rating) data.rating = Number(data.rating);
    if (data.unlimitedStock === 'true' || data.unlimitedStock === true) data.unlimited_stock = true;
    else if (data.unlimitedStock === 'false' || data.unlimitedStock === false) data.unlimited_stock = false;

    // Clean up old camelCase keys
    delete data.originalPrice;
    delete data.unlimitedStock;

    return data;
};

// GET All Products (Public)
router.get('/', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET Single Product (Public)
router.get('/:id', async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json(product);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// CREATE Product (Admin Only)
router.post('/', auth, adminAuth, upload.single('image'), async (req, res) => {
    try {
        const productData = parseBody(req.body);
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Create Error:", err);
        res.status(400).json({ message: 'Error creating product', error: err.message });
    }
});

// UPDATE Product (Admin Only)
router.put('/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
    try {
        const productData = parseBody(req.body);
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

        res.json(updatedProduct);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(400).json({ message: 'Error updating product', error: err.message });
    }
});

// DELETE Product (Admin Only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Product deleted successfully', id: req.params.id });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
