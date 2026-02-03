const { supabase } = require('../config/supabase');

/**
 * Auth Middleware - Supabase Session Verification
 * 
 * Verifies Supabase access token and retrieves user data.
 */
module.exports = async function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth Middleware: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth Middleware: Token verification failed:', error?.message);
            return res.status(401).json({ message: 'Token is not valid or expired', error: error?.message });
        }

        // Fetch full user data from public.users table (using ADMIN/SERVICE role client)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            console.error('Auth Middleware: User data fetch failed for ID:', user.id, userError?.message);
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
        console.error('Auth Middleware: Server error:', err);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};
