const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');

app.use(cors());

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Note: mongoSanitize removed - Supabase handles SQL injection protection

// Global Rate Limiting for API routes
app.use('/api/', apiLimiter);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize Supabase Connection
const { supabase } = require('./config/supabase');
console.log('Supabase client initialized');

const { startWorker: startTPBankWorker } = require('./workers/tpbankWorker');

// Start background workers after a short delay
setTimeout(() => {
    try {
        startTPBankWorker(); // Start TPBank Background Worker
        console.log('Background workers started');
    } catch (error) {
        console.error('Error starting background workers:', error.message);
    }
}, 2000);

// Routes
app.get('/', (req, res) => {
    res.send('R4B Backend is Running');
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/oauth')); // Google OAuth routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', statsRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/keys', require('./routes/keys'));
app.use('/api/balance', require('./routes/balance'));
app.use('/api/tickets', require('./routes/tickets'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
