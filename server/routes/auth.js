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
        // req.user has been set by auth middleware, which verified the Supabase JWT
        // Get user data from public.users
        let { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, balance, is_verified')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }

        // SYNC: Check if Supabase Auth user is verified but public.users isn't
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(req.user.id);

        if (!authError && authUser && authUser.email_confirmed_at && !data.is_verified) {
            console.log(`Syncing is_verified for user ${data.email}`);
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ is_verified: true })
                .eq('id', req.user.id)
                .select()
                .single();

            if (!updateError && updatedUser) {
                data = updatedUser;
            }
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

// Forgot Password - Send reset email via Supabase
router.post('/forgot-password', authLimiter, [
    body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { email } = req.body;
        const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`;

        // Use Supabase to send password reset email
        const { error } = await supabaseAnonClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });

        if (error) {
            console.error('Forgot password error:', error);
            // Don't reveal if email exists or not for security
        }

        // Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reset Password - Update password with Supabase session
router.post('/reset-password/:token', [
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { password } = req.body;
        const { token } = req.params;

        // Supabase uses access_token from URL for password reset
        // The token in URL is actually the access_token after email verification
        const { data, error } = await supabaseAnonClient.auth.updateUser({
            password: password
        });

        if (error) {
            // If direct update fails, try to exchange the token first
            console.error('Password update error:', error);
            return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
        }

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify Token - Check if Supabase session is valid
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ valid: false, message: 'Token is required' });
        }

        // Verify the Supabase token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
        }

        // Get user data from public.users
        const { data: userData } = await supabase
            .from('users')
            .select('id, username, email, role, is_verified')
            .eq('id', user.id)
            .single();

        res.json({
            valid: true,
            user: userData || { id: user.id, email: user.email }
        });

    } catch (err) {
        console.error('Token verification error:', err);
        res.status(500).json({ valid: false, message: 'Server error' });
    }
});

// Verify Payment - Check if user is verified for payment
router.post('/verify-payment', auth, async (req, res) => {
    try {
        // Get user verification status
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, is_verified, role')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ verified: false, message: 'User not found' });
        }

        res.json({
            verified: user.is_verified,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ verified: false, message: 'Server error' });
    }
});

module.exports = router;
