import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    DollarSign,
    TrendingUp,
    Copy,
    Check,
    Gift,
    ChevronRight,
    Clock,
    Star
} from 'lucide-react';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { cn } from '../../components/common/utils';

export const AffiliateView: React.FC = () => {
    const { stats, referrals, commissions, tiers, isLoading, getReferralLink } = useAffiliate();
    const [copied, setCopied] = useState(false);

    const copyReferralLink = async () => {
        const link = getReferralLink();
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Referrals', value: stats.totalReferrals, icon: Users, color: 'cyan' },
        { label: 'Active Referrals', value: stats.activeReferrals, icon: Star, color: 'green' },
        { label: 'Pending Earnings', value: `$${stats.pendingEarnings.toFixed(2)}`, icon: Clock, color: 'yellow' },
        { label: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'emerald' },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Tier Badge */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
                    <p className="text-white/60">Invite friends & earn commission on every purchase</p>
                </div>

                {/* Tier Badge */}
                <motion.div
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                    whileHover={{ scale: 1.02 }}
                >
                    <span className="text-3xl">{stats.tier.icon}</span>
                    <div>
                        <div className="text-sm text-white/60">Current Tier</div>
                        <div className="font-bold text-white" style={{ color: stats.tier.color }}>
                            {stats.tier.displayName}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-white/60">Commission</div>
                        <div className="font-bold text-cyan-400">{(stats.tier.commissionRate * 100).toFixed(0)}%</div>
                    </div>
                </motion.div>
            </div>

            {/* Referral Link Card */}
            <motion.div
                className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Your Referral Link</h2>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 font-mono text-cyan-400 truncate">
                        {getReferralLink()}
                    </div>
                    <motion.button
                        onClick={copyReferralLink}
                        className={cn(
                            "px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all",
                            copied
                                ? "bg-green-500 text-white"
                                : "bg-cyan-500 hover:bg-cyan-600 text-black"
                        )}
                        whileTap={{ scale: 0.95 }}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                </div>

                <p className="mt-3 text-sm text-white/50">
                    Share this link with friends. When they sign up and make a purchase, you earn {(stats.tier.commissionRate * 100).toFixed(0)}% commission!
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white/60">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tier Progress */}
            {stats.nextTier && (
                <motion.div
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            Progress to Next Tier
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{stats.tier.icon}</span>
                            <ChevronRight className="w-5 h-5 text-white/40" />
                            <span className="text-2xl">{stats.nextTier.icon}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-4 rounded-full bg-white/10 overflow-hidden mb-4">
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progressToNextTier}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-white/60">
                            Referrals: <span className="text-white font-medium">{stats.totalReferrals}</span> / {stats.nextTier.minReferrals}
                        </span>
                        <span className="text-white/60">
                            Upgrade to <span className="font-medium" style={{ color: stats.nextTier.color }}>{stats.nextTier.displayName}</span> for {(stats.nextTier.commissionRate * 100).toFixed(0)}% commission
                        </span>
                    </div>
                </motion.div>
            )}

            {/* All Tiers Overview */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Affiliate Tiers</h2>
                <div className="grid grid-cols-4 gap-4">
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.id}
                            className={cn(
                                "p-4 rounded-xl border text-center transition-all",
                                stats.tier.id === tier.id
                                    ? "bg-white/10 border-cyan-500/50"
                                    : "bg-white/5 border-white/10 opacity-60"
                            )}
                            whileHover={{ scale: 1.02, opacity: 1 }}
                        >
                            <div className="text-3xl mb-2">{tier.icon}</div>
                            <div className="font-semibold text-white" style={{ color: tier.color }}>
                                {tier.displayName}
                            </div>
                            <div className="text-2xl font-bold text-cyan-400 my-2">
                                {(tier.commissionRate * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/50">
                                {tier.minReferrals}+ refs • ${tier.minDeposit}+ deposit
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Commissions */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Commissions</h2>
                {commissions.length === 0 ? (
                    <div className="text-center py-8 text-white/40">
                        <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No commissions yet. Share your link to start earning!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {commissions.map((commission) => (
                            <div
                                key={commission.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                            >
                                <div>
                                    <div className="font-medium text-white">{commission.productName}</div>
                                    <div className="text-sm text-white/60">
                                        From {commission.referredUser} • {new Date(commission.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-400">+${commission.amount.toFixed(2)}</div>
                                    <div className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        commission.status === 'paid' ? "bg-green-500/20 text-green-400" :
                                            commission.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" :
                                                "bg-white/10 text-white/60"
                                    )}>
                                        {commission.status}
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

export default AffiliateView;
