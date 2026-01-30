/**
 * Google OAuth Callback Route
 * Handles authentication callback from Supabase OAuth flow
 * 
 * SETUP GUIDE:
 * 1. Go to Supabase Dashboard → Authentication → Providers → Google
 * 2. Enable Google provider
 * 3. Add Google OAuth credentials from Google Cloud Console
 * 4. Set Redirect URL to: <CLIENT_URL>/auth/callback
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase, supabaseAnonClient } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET is not defined.');
}

/**
 * POST /api/auth/google/callback
 * Verify Supabase session and sync user data to database
 */
router.post('/google/callback', async (req, res) => {
    try {
        const { access_token, refresh_token } = req.body;

        if (!access_token) {
            return res.status(400).json({ message: 'Access token is required' });
        }

        // Verify session with Supabase using anon client
        if (!supabaseAnonClient) {
            return res.status(500).json({ message: 'Supabase anon client not configured' });
        }

        const { data: { user: supabaseUser }, error: authError } = await supabaseAnonClient.auth.getUser(access_token);

        if (authError || !supabaseUser) {
            console.error('Supabase auth error:', authError);
            return res.status(401).json({ message: 'Invalid session token' });
        }

        // Extract user data from Google
        const email = supabaseUser.email;
        const username = supabaseUser.user_metadata?.full_name || email.split('@')[0];
        const googleId = supabaseUser.id;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        let user;

        if (existingUser) {
            // Update existing user
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    google_id: googleId,
                    is_verified: true, // Auto-verify OAuth users
                    last_login: new Date().toISOString()
                })
                .eq('email', email)
                .select()
                .single();

            if (updateError) throw updateError;
            user = updatedUser;
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    username,
                    email,
                    google_id: googleId,
                    is_verified: true, // Auto-verify OAuth users
                    password: null, // No password for OAuth users
                    role: 'user',
                    balance: 0,
                    last_login: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        }

        // Generate JWT token for session management
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                balance: user.balance
            }
        });
    } catch (err) {
        console.error('Google OAuth callback error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/**
 * GET /api/auth/google/url
 * Get Supabase OAuth URL for Google sign-in
 */
router.get('/google/url', async (req, res) => {
    try {
        if (!supabaseAnonClient) {
            return res.status(500).json({ message: 'Supabase anon client not configured' });
        }

        const redirectTo = process.env.CLIENT_URL || 'http://localhost:8080';

        const { data, error } = await supabaseAnonClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${redirectTo}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) throw error;

        res.json({
            success: true,
            url: data.url
        });
    } catch (err) {
        console.error('Get Google OAuth URL error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
