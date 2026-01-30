const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET /api/stats/overview - Admin Dashboard Stats (OPTIMIZED)
router.get('/overview', auth, adminAuth, async (req, res) => {
    try {
        // Calculate total revenue from completed orders
        const { data: revenueData } = await supabase
            .from('orders')
            .select('amount')
            .eq('status', 'completed');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        const completedCount = revenueData?.length || 0;

        // Get status counts
        const { data: allOrders } = await supabase
            .from('orders')
            .select('status');

        const ordersByStatus = {};
        allOrders?.forEach(order => {
            const status = order.status;
            ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
        });

        // Get revenue trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentOrders } = await supabase
            .from('orders')
            .select('amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', sevenDaysAgo.toISOString());

        // Group by date
        const revenueTrendMap = {};
        recentOrders?.forEach(order => {
            const date = new Date(order.created_at);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueTrendMap[dateStr] = (revenueTrendMap[dateStr] || 0) + (order.amount || 0);
        });

        const revenueTrendData = Object.entries(revenueTrendMap).map(([date, amount]) => ({
            date,
            amount
        }));

        // Get user stats
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: newUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        // Calculate revenue growth
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: lastMonthOrders } = await supabase
            .from('orders')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const { data: prevMonthOrders } = await supabase
            .from('orders')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString());

        const lastMonthRevenue = lastMonthOrders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
        const previousMonthRevenue = prevMonthOrders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

        const revenueGrowth = previousMonthRevenue > 0
            ? Math.round(((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
            : 0;

        // Get recent transactions
        const { data: recentTransactions } = await supabase
            .from('orders')
            .select('order_id, username, product_name, amount, status, created_at, payment_method')
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            revenue: {
                total: totalRevenue,
                trend: revenueTrendData.length > 0 ? revenueTrendData : [{ date: 'Today', amount: 0 }],
                growth: revenueGrowth
            },
            orders: {
                total: allOrders?.length || 0,
                pending: ordersByStatus['pending'] || 0,
                completed: ordersByStatus['completed'] || 0,
                paid: ordersByStatus['paid'] || 0,
                byStatus: ordersByStatus
            },
            users: {
                total: totalUsers || 0,
                growth: newUsers || 0
            },
            recentOrders: (recentTransactions || []).map(o => ({
                id: o.order_id || o.id,
                user: o.username,
                product: o.product_name,
                amount: o.amount,
                status: o.status,
                date: o.created_at
            }))
        });

    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
