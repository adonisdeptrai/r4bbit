const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET All Users (Admin Only)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, role, balance, avatar, is_verified, is_banned, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(users);
    } catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// UPDATE User Info (Admin Only)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { username, email, role } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({
                ...(username && { username }),
                ...(email && { email }),
                ...(role && { role })
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error("Update User Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// BAN / UNBAN User (Admin Only)
router.put('/:id/ban', auth, adminAuth, async (req, res) => {
    try {
        // Prevent banning yourself
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot ban yourself' });
        }

        // Get current user
        const { data: currentUser } = await supabase
            .from('users')
            .select('is_banned')
            .eq('id', req.params.id)
            .single();

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        // Toggle ban status
        const { data: user, error } = await supabase
            .from('users')
            .update({ is_banned: !currentUser.is_banned })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: `User ${user.is_banned ? 'banned' : 'unbanned'} successfully`,
            isBanned: user.is_banned,
            id: user.id
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ADJUST Balance (Admin Only)
router.put('/:id/balance', auth, adminAuth, async (req, res) => {
    try {
        const { amount, mode } = req.body; // mode: 'set' | 'add' | 'subtract'

        const { data: user } = await supabase
            .from('users')
            .select('balance')
            .eq('id', req.params.id)
            .single();

        if (!user) return res.status(404).json({ message: 'User not found' });

        let newBalance = user.balance;
        const val = Number(amount);

        if (isNaN(val)) return res.status(400).json({ message: 'Invalid amount' });

        if (mode === 'add') newBalance += val;
        else if (mode === 'subtract') newBalance -= val;
        else newBalance = val; // Default to set

        if (newBalance < 0) newBalance = 0; // Prevent negative balance

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Balance updated successfully',
            balance: updatedUser.balance,
            id: updatedUser.id
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE User (Admin Only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'User deleted successfully', id: req.params.id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
