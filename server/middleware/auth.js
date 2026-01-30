const { supabase } = require('../config/supabase');

/**
 * Auth Middleware - Supabase Session Verification
 * 
 * Refactored từ custom JWT sang Supabase Auth
 * - Verify Supabase access token instead of custom JWT
 * - Extract user from Supabase session
 * - Attach user to req.user
 */

module.exports = async function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify token với Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Token verification failed:', error?.message);
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Fetch full user data từ public.users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            console.error('User data fetch failed:', userError?.message);
            return res.status(404).json({ message: 'User not found in database' });
        }

        // Attach user to request object
        req.user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            balance: userData.balance,
            is_verified: userData.is_verified
        };

        next();

    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};
