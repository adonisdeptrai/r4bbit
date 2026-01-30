/**
 * Admin Authorization Middleware
 * Requires auth middleware to be called first (to set req.user)
 * Checks if user has admin role
 */
module.exports = function (req, res, next) {
    // Check if user exists and has admin role
    if (!req.user) {
        return res.status(401).json({ message: 'Authorization required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
};
