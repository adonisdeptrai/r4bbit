import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    AffiliateStats,
    AffiliateTierConfig,
    Referral,
    Commission,
    DEFAULT_AFFILIATE_TIERS,
    generateReferralCode,
    checkTierEligibility
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

    // Generate stats for current user
    const refreshStats = useCallback(async () => {
        if (!user) {
            setStats(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual API call
            // For now, generate mock data based on user
            const referralCode = generateReferralCode(user.id);
            const mockReferrals = Math.floor(Math.random() * 20);
            const mockDeposit = Math.floor(Math.random() * 300);

            const currentTier = checkTierEligibility(mockReferrals, mockDeposit, tiers);
            const nextTierIndex = tiers.findIndex(t => t.id === currentTier.id) + 1;
            const nextTier = tiers[nextTierIndex];

            let progressToNextTier = 100;
            if (nextTier) {
                const referralProgress = (mockReferrals / nextTier.minReferrals) * 100;
                const depositProgress = nextTier.minDeposit > 0 ? (mockDeposit / nextTier.minDeposit) * 100 : 100;
                progressToNextTier = Math.min(Math.min(referralProgress, depositProgress), 99);
            }

            setStats({
                tier: currentTier,
                referralCode,
                totalReferrals: mockReferrals,
                activeReferrals: Math.floor(mockReferrals * 0.7),
                totalEarnings: Math.floor(Math.random() * 500),
                pendingEarnings: Math.floor(Math.random() * 50),
                nextTier,
                progressToNextTier
            });

            // Mock referrals list
            setReferrals([]);

            // Mock commissions list  
            setCommissions([]);

        } catch (err) {
            setError('Failed to load affiliate stats');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user, tiers]);

    // Load stats when user changes
    useEffect(() => {
        if (user) {
            refreshStats();
        }
    }, [user, refreshStats]);

    // Apply referral code during signup
    const applyReferralCode = async (code: string): Promise<boolean> => {
        try {
            // TODO: Replace with actual API call
            console.log('Applying referral code:', code);
            localStorage.removeItem(REFERRAL_CODE_KEY);
            return true;
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
