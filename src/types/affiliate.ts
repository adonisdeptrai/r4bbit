// Affiliate/Referral System Types

export type AffiliateTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AffiliateTierConfig {
    id: number;
    name: AffiliateTier;
    displayName: string;
    displayNameVi: string;
    commissionRate: number; // 0.05 = 5%
    minReferrals: number;
    minDeposit: number;
    icon: string;
    color: string;
    sortOrder: number;
}

export interface AffiliateStats {
    tier: AffiliateTierConfig;
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    nextTier?: AffiliateTierConfig;
    progressToNextTier: number; // 0-100%
}

export interface Referral {
    id: string;
    referredUser: {
        id: string;
        username: string;
        avatar?: string;
        joinedAt: string;
    };
    status: 'registered' | 'deposited' | 'active';
    totalSpent: number;
    commissionsGenerated: number;
    createdAt: string;
}

export interface Commission {
    id: string;
    orderId: string;
    amount: number;
    rate: number;
    tierAtTime: AffiliateTier;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    referredUser: string;
    productName: string;
    createdAt: string;
    paidAt?: string;
}

// Default tier configurations
export const DEFAULT_AFFILIATE_TIERS: AffiliateTierConfig[] = [
    {
        id: 1,
        name: 'bronze',
        displayName: 'Bronze',
        displayNameVi: 'Đồng',
        commissionRate: 0.05,
        minReferrals: 0,
        minDeposit: 0,
        icon: '🥉',
        color: '#CD7F32',
        sortOrder: 1
    },
    {
        id: 2,
        name: 'silver',
        displayName: 'Silver',
        displayNameVi: 'Bạc',
        commissionRate: 0.08,
        minReferrals: 5,
        minDeposit: 50,
        icon: '🥈',
        color: '#C0C0C0',
        sortOrder: 2
    },
    {
        id: 3,
        name: 'gold',
        displayName: 'Gold',
        displayNameVi: 'Vàng',
        commissionRate: 0.12,
        minReferrals: 15,
        minDeposit: 200,
        icon: '🥇',
        color: '#FFD700',
        sortOrder: 3
    },
    {
        id: 4,
        name: 'diamond',
        displayName: 'Diamond',
        displayNameVi: 'Kim Cương',
        commissionRate: 0.15,
        minReferrals: 50,
        minDeposit: 500,
        icon: '💎',
        color: '#B9F2FF',
        sortOrder: 4
    }
];

// Helper to get tier by name
export const getTierConfig = (tierName: AffiliateTier): AffiliateTierConfig => {
    return DEFAULT_AFFILIATE_TIERS.find(t => t.name === tierName) || DEFAULT_AFFILIATE_TIERS[0];
};

// Helper to calculate next tier
export const getNextTier = (currentTier: AffiliateTier): AffiliateTierConfig | undefined => {
    const currentIndex = DEFAULT_AFFILIATE_TIERS.findIndex(t => t.name === currentTier);
    return DEFAULT_AFFILIATE_TIERS[currentIndex + 1];
};

// Helper to check tier eligibility
export const checkTierEligibility = (
    referrals: number,
    totalDeposit: number,
    tiers: AffiliateTierConfig[] = DEFAULT_AFFILIATE_TIERS
): AffiliateTierConfig => {
    // Sort by sortOrder descending to check highest tier first
    const sortedTiers = [...tiers].sort((a, b) => b.sortOrder - a.sortOrder);

    for (const tier of sortedTiers) {
        if (referrals >= tier.minReferrals && totalDeposit >= tier.minDeposit) {
            return tier;
        }
    }

    return tiers[0]; // Default to bronze
};

// Generate referral code from user ID
export const generateReferralCode = (userId: string): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let code = '';

    for (let i = 0; i < 8; i++) {
        code += chars[(hash * (i + 1)) % chars.length];
    }

    return code;
};
