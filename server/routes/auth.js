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
