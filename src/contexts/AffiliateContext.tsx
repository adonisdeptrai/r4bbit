import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import {
    AffiliateStats,
    AffiliateTierConfig,
    Referral,
    Commission,
    DEFAULT_AFFILIATE_TIERS
} from '../types/affiliate';

const REFERRAL_CODE_KEY = 'r4bbit_referral_code';

interface AffiliateContextType {
    stats: AffiliateStats | null;
    referrals: Referral[];
    commissions: Commission[];
    tiers: AffiliateTierConfig[];
    isLoading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
    applyReferralCode: (code: string) => Promise<boolean>;
    getReferralLink: () => string;
    storedReferralCode: string | null;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

// Helper to get stored referral code from URL or localStorage
const getStoredReferralCode = (): string | null => {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');

    if (refFromUrl) {
        localStorage.setItem(REFERRAL_CODE_KEY, refFromUrl);
        // Clean URL without refresh
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
        return refFromUrl;
    }

    return localStorage.getItem(REFERRAL_CODE_KEY);
};

export const AffiliateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [tiers, setTiers] = useState<AffiliateTierConfig[]>(DEFAULT_AFFILIATE_TIERS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [storedReferralCode] = useState<string | null>(() => getStoredReferralCode());

    // Load tiers from database
    useEffect(() => {
        const loadTiers = async () => {
            try {
                const { data, error } = await supabase
                    .from('affiliate_tiers')
                    .select('*')
                    .order('sort_order');

                if (error) throw error;
                if (data && data.length > 0) {
                    setTiers(data.map(t => ({
                        id: t.id,
                        name: t.name,
                        displayName: t.display_name,
                        displayNameVi: t.display_name_vi,
                        commissionRate: parseFloat(t.commission_rate),
                        minReferrals: t.min_referrals,
                        minDeposit: parseFloat(t.min_deposit),
                        icon: t.icon,
                        color: t.color,
                        sortOrder: t.sort_order
                    })));
                }
            } catch (err) {
                console.error('Failed to load tiers:', err);
            }
        };
        loadTiers();
    }, []);

    // Generate stats for current user
    const refreshStats = useCallback(async () => {
        if (!user) {
            setStats(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call database function to get stats
            const { data: statsData, error: statsError } = await supabase
                .rpc('get_affiliate_stats', { user_id: user.id });

            if (statsError) throw statsError;

            if (statsData) {
                setStats({
                    tier: statsData.tier,
                    referralCode: statsData.referralCode,
                    totalReferrals: statsData.totalReferrals || 0,
                    activeReferrals: statsData.activeReferrals || 0,
                    totalEarnings: parseFloat(statsData.totalEarnings) || 0,
                    pendingEarnings: parseFloat(statsData.pendingEarnings) || 0,
                    nextTier: statsData.nextTier,
                    progressToNextTier: parseFloat(statsData.progressToNextTier) || 0
                });
            }

            // Load referrals
            const { data: referralsData } = await supabase
                .from('referrals')
                .select(`
                    id,
                    status,
                    total_spent,
                    commissions_generated,
                    created_at,
                    referred:referred_id (id, username, avatar_url, created_at)
                `)
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false });

            if (referralsData) {
                setReferrals(referralsData.map((r: any) => ({
                    id: r.id,
                    referredUser: {
                        id: r.referred?.id,
                        username: r.referred?.username || 'Unknown',
                        avatar: r.referred?.avatar_url,
                        joinedAt: r.referred?.created_at
                    },
                    status: r.status,
                    totalSpent: parseFloat(r.total_spent) || 0,
                    commissionsGenerated: parseFloat(r.commissions_generated) || 0,
                    createdAt: r.created_at
                })));
            }

            // Load commissions
            const { data: commissionsData } = await supabase
                .from('commissions')
                .select('*')
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (commissionsData) {
                setCommissions(commissionsData.map((c: any) => ({
                    id: c.id,
                    orderId: c.order_id,
                    amount: parseFloat(c.amount),
                    rate: parseFloat(c.rate),
                    tierAtTime: c.tier_at_time,
                    status: c.status,
                    referredUser: c.referred_username || 'Unknown',
                    productName: c.product_name || 'Product',
                    createdAt: c.created_at,
                    paidAt: c.paid_at
                })));
            }

        } catch (err) {
            setError('Failed to load affiliate stats');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Load stats when user changes
    useEffect(() => {
        if (user) {
            refreshStats();
        }
    }, [user, refreshStats]);

    // Apply referral code during signup
    const applyReferralCode = async (code: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { data, error } = await supabase
                .rpc('apply_referral_code', {
                    new_user_id: user.id,
                    code: code.toUpperCase()
                });

            if (error) throw error;

            if (data) {
                localStorage.removeItem(REFERRAL_CODE_KEY);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to apply referral code:', err);
            return false;
        }
    };

    // Get shareable referral link
    const getReferralLink = (): string => {
        const baseUrl = window.location.origin;
        const code = stats?.referralCode || '';
        return `${baseUrl}?ref=${code}`;
    };

    return (
        <AffiliateContext.Provider
            value={{
                stats,
                referrals,
                commissions,
                tiers,
                isLoading,
                error,
                refreshStats,
                applyReferralCode,
                getReferralLink,
                storedReferralCode
            }}
        >
            {children}
        </AffiliateContext.Provider>
    );
};

export const useAffiliate = () => {
    const context = useContext(AffiliateContext);
    if (!context) {
        throw new Error('useAffiliate must be used within an AffiliateProvider');
    }
    return context;
};
