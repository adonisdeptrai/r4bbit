/**
 * OAuth Routes - Simplified for Supabase Auth
 * 
 * Migration Note: OAuth now handled entirely by Supabase
 * Frontend calls Supabase directly, no backend callback needed
 * This file kept for legacy compatibility only
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

/**
 * POST /api/auth/oauth/callback
 * DEPRECATED: Frontend should handle OAuth callback directly with Supabase
 * Kept for backward compatibility
 */
router.post('/callback', async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: 'User ID required' });
        }

        // Fetch user data from public.users table
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();

        if (error || !userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                balance: userData.balance
            }
        });

    } catch (err) {
        console.error('OAuth callback error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
