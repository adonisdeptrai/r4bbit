import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    DollarSign,
    Settings,
    Save,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { cn } from '../../../components/common/utils';
import { AffiliateTierConfig, DEFAULT_AFFILIATE_TIERS } from '../../../types/affiliate';

// Mock data for admin view
const MOCK_TOP_AFFILIATES = [
    { id: '1', username: 'protrader123', tier: 'diamond', referrals: 87, earnings: 2450.00, pending: 125.00 },
    { id: '2', username: 'mmohunter', tier: 'gold', referrals: 34, earnings: 890.50, pending: 45.00 },
    { id: '3', username: 'cryptoboss', tier: 'gold', referrals: 28, earnings: 720.00, pending: 0 },
    { id: '4', username: 'digitalwizard', tier: 'silver', referrals: 12, earnings: 310.25, pending: 22.50 },
    { id: '5', username: 'newbie2024', tier: 'bronze', referrals: 3, earnings: 45.00, pending: 15.00 },
];

const MOCK_PENDING_PAYOUTS = [
    { id: 'c1', username: 'protrader123', amount: 125.00, orders: 5, createdAt: '2024-02-08' },
    { id: 'c2', username: 'mmohunter', amount: 45.00, orders: 2, createdAt: '2024-02-09' },
    { id: 'c3', username: 'newbie2024', amount: 15.00, orders: 1, createdAt: '2024-02-10' },
];

const getTierBadge = (tierName: string) => {
    const tier = DEFAULT_AFFILIATE_TIERS.find(t => t.name === tierName);
    if (!tier) return null;
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
            {tier.icon} {tier.displayName}
        </span>
    );
};

export const AdminAffiliates: React.FC = () => {
    const [tiers, setTiers] = useState<AffiliateTierConfig[]>(DEFAULT_AFFILIATE_TIERS);
    const [editingTiers, setEditingTiers] = useState(false);
    const [savedMessage, setSavedMessage] = useState(false);

    const handleTierChange = (tierId: number, field: keyof AffiliateTierConfig, value: any) => {
        setTiers(prev => prev.map(t =>
            t.id === tierId ? { ...t, [field]: value } : t
        ));
    };

    const saveTierConfig = () => {
        // TODO: Save to backend
        console.log('Saving tier config:', tiers);
        setSavedMessage(true);
        setEditingTiers(false);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const handlePayout = (id: string, action: 'approve' | 'reject') => {
        console.log(`${action} payout:`, id);
        // TODO: API call
    };

    // Stats
    const totalAffiliates = MOCK_TOP_AFFILIATES.length;
    const totalEarnings = MOCK_TOP_AFFILIATES.reduce((sum, a) => sum + a.earnings, 0);
    const pendingPayouts = MOCK_PENDING_PAYOUTS.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Affiliate Management</h1>
                    <p className="text-white/60">Manage affiliate tiers and payouts</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{totalAffiliates}</div>
                            <div className="text-sm text-white/60">Total Affiliates</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
                            <div className="text-sm text-white/60">Total Paid</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">${pendingPayouts.toFixed(2)}</div>
                            <div className="text-sm text-white/60">Pending Payouts</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tier Configuration */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-cyan-400" />
                        Tier Configuration
                    </h2>
                    <div className="flex gap-2">
                        {!editingTiers ? (
                            <button
                                onClick={() => setEditingTiers(true)}
                                className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition"
                            >
                                Edit Tiers
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditingTiers(false)}
                                    className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveTierConfig}
                                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {savedMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">
                        ✓ Tier configuration saved successfully!
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/60 text-sm border-b border-white/10">
                                <th className="pb-3">Tier</th>
                                <th className="pb-3">Commission Rate</th>
                                <th className="pb-3">Min Referrals</th>
                                <th className="pb-3">Min Deposit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map((tier) => (
                                <tr key={tier.id} className="border-b border-white/5">
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{tier.icon}</span>
                                            <span className="font-medium text-white" style={{ color: tier.color }}>
                                                {tier.displayName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        {editingTiers ? (
                                            <input
                                                type="number"
                                                value={(tier.commissionRate * 100).toFixed(0)}
                                                onChange={(e) => handleTierChange(tier.id, 'commissionRate', parseFloat(e.target.value) / 100)}
                                                className="w-20 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                                                min="0"
                                                max="100"
                                            />
                                        ) : (
                                            <span className="text-cyan-400 font-medium">
                                                {(tier.commissionRate * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        {editingTiers ? (
                                            <input
                                                type="number"
                                                value={tier.minReferrals}
                                                onChange={(e) => handleTierChange(tier.id, 'minReferrals', parseInt(e.target.value))}
                                                className="w-20 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                                                min="0"
                                            />
                                        ) : (
                                            <span className="text-white">{tier.minReferrals}</span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        {editingTiers ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-white/60">$</span>
                                                <input
                                                    type="number"
                                                    value={tier.minDeposit}
                                                    onChange={(e) => handleTierChange(tier.id, 'minDeposit', parseFloat(e.target.value))}
                                                    className="w-24 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                                                    min="0"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-white">${tier.minDeposit}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Affiliates */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Top Affiliates
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/60 text-sm border-b border-white/10">
                                <th className="pb-3">#</th>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Tier</th>
                                <th className="pb-3">Referrals</th>
                                <th className="pb-3">Earnings</th>
                                <th className="pb-3">Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_TOP_AFFILIATES.map((affiliate, index) => (
                                <tr key={affiliate.id} className="border-b border-white/5">
                                    <td className="py-3 text-white/60">{index + 1}</td>
                                    <td className="py-3 font-medium text-white">{affiliate.username}</td>
                                    <td className="py-3">{getTierBadge(affiliate.tier)}</td>
                                    <td className="py-3 text-white">{affiliate.referrals}</td>
                                    <td className="py-3 text-green-400">${affiliate.earnings.toFixed(2)}</td>
                                    <td className="py-3 text-yellow-400">
                                        {affiliate.pending > 0 ? `$${affiliate.pending.toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Payouts */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Pending Payouts
                </h2>

                {MOCK_PENDING_PAYOUTS.length === 0 ? (
                    <div className="text-center py-8 text-white/40">
                        No pending payouts
                    </div>
                ) : (
                    <div className="space-y-3">
                        {MOCK_PENDING_PAYOUTS.map((payout) => (
                            <div
                                key={payout.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                            >
                                <div>
                                    <div className="font-medium text-white">{payout.username}</div>
                                    <div className="text-sm text-white/60">
                                        {payout.orders} orders • Requested {new Date(payout.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xl font-bold text-yellow-400">
                                        ${payout.amount.toFixed(2)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePayout(payout.id, 'approve')}
                                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handlePayout(payout.id, 'reject')}
                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAffiliates;
