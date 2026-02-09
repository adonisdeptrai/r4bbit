import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistAPI } from '../config/supabaseApi';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistIds: string[];
    isLoading: boolean;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshWishlist = useCallback(async () => {
        if (!user) {
            setWishlistIds([]);
            return;
        }

        setIsLoading(true);
        try {
            const ids = await WishlistAPI.getProductIds();
            setWishlistIds(ids);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistIds.includes(productId);
    }, [wishlistIds]);

    const toggleWishlist = useCallback(async (productId: string) => {
        if (!user) return;

        // Optimistic update
        const isCurrentlyInList = wishlistIds.includes(productId);

        if (isCurrentlyInList) {
            setWishlistIds(prev => prev.filter(id => id !== productId));
        } else {
            setWishlistIds(prev => [...prev, productId]);
        }

        try {
            await WishlistAPI.toggle(productId);
        } catch (error) {
            // Revert on error
            if (isCurrentlyInList) {
                setWishlistIds(prev => [...prev, productId]);
            } else {
                setWishlistIds(prev => prev.filter(id => id !== productId));
            }
            console.error('Failed to toggle wishlist:', error);
        }
    }, [user, wishlistIds]);

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            isLoading,
            isInWishlist,
            toggleWishlist,
            refreshWishlist,
            wishlistCount: wishlistIds.length
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
