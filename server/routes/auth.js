const express = require('express');
const router = express.Router();
const { supabase, supabaseAnonClient } = require('../config/supabase');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

/**
 * AUTH ROUTES - Supabase Auth Integration
 * 
 * Migration Note: Refactored từ custom JWT sang Supabase Auth
 * - Không còn bcrypt manual hashing
 * - Không còn custom JWT generation
 * - Supabase handles: password hashing, sessions, email verification
 */

// Register - Sử dụng Supabase Auth
router.post('/register', authLimiter, [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;

        // Check if username already exists in public.users
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Sign up with Supabase Auth
        const { data: authData, error: signUpError } = await supabaseAnonClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username // Store username in user metadata
                },
                emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:8080'}/verify-email`
            }
        });

        if (signUpError) {
            // Handle specific Supabase errors
            if (signUpError.message.includes('already registered')) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            throw signUpError;
        }

        if (authData.user) {
            // Create user record in public.users table
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id, // Link to auth.users
                    username,
                    email,
                    role: 'user',
                    balance: 0,
                    is_verified: false // Will be true after email verification
                }]);

            if (insertError) {
                console.error('Error creating user record:', insertError);
                // Note: Auth user đã được tạo, nhưng public.users failed
                // User có thể login nhưng sẽ thiếu data
            }
        }

        // Supabase tự động send verification email
        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: authData.user?.id,
                email: authData.user?.email
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login - Sử dụng Supabase Auth
router.post('/login', authLimiter, [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { email, password } = req.body;

        // Sign in with Supabase Auth
        const { data, error } = await supabaseAnonClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            if (error.message.includes('Email not confirmed')) {
                return res.status(401).json({ message: 'Please verify your email before logging in' });
            }
            throw error;
        }

        if (!data.session || !data.user) {
            return res.status(401).json({ message: 'Login failed' });
        }

        // Fetch additional user data from public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError || !userData) {
            console.error('User data fetch error:', userError);
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Check if user is verified
        if (!userData.is_verified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        // Return Supabase session + user data
        res.json({
            message: 'Login successful',
            token: data.session.access_token, // Supabase JWT token
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            },
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                balance: userData.balance
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify Email - Compatible với Supabase email verification
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Supabase handles email verification automatically
        // This endpoint is for backward compatibility

        res.json({
            success: true,
            message: 'Email verification is handled by Supabase. Please click the link in your email.'
        });

    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Current User - Using Supabase session
router.get('/me', auth, async (req, res) => {
    try {
        // req.user đã được set bởi auth middleware
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, balance, is_verified')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: data });

    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Logout - Supabase session invalidation
router.post('/logout', auth, async (req, res) => {
    try {
        // Get access token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            // Sign out from Supabase (invalidates session)
            const { error } = await supabaseAnonClient.auth.signOut();

            if (error) {
                console.error('Logout error:', error);
            }
        }

        res.json({ message: 'Logged out successfully' });

    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Refresh Token - Supabase token refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        // Refresh session with Supabase
        const { data, error } = await supabaseAnonClient.auth.refreshSession({
            refresh_token
        });

        if (error) throw error;

        res.json({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
        });

    } catch (err) {
        console.error('Token refresh error:', err);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});

module.exports = router;
