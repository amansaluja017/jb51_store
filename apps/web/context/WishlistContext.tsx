'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client/react';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: string[]; // array of product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Background mutation to sync with tRPC in the background
  const syncMutation = api.wishlist.sync.useMutation({
    onError: (err) => {
      console.error('Background wishlist sync failed:', err);
    },
    onSuccess: (data) => {
      console.log('Background wishlist sync successful:', data);
    }
  });

  // Load from localStorage on mount (Client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jb51_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage and Server in background when state changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('jb51_wishlist', JSON.stringify(wishlist));
      
      // Perform background sync (Optimistic UI: state updates first, mutation hits in background)
      syncMutation.mutate({ productIds: wishlist });
    } catch (e) {
      console.error('Failed to sync wishlist:', e);
    }
  }, [wishlist, isInitialized]);

  const addToWishlist = (productId: string) => {
    if (wishlist.includes(productId)) return;
    setWishlist(prev => [...prev, productId]);
    toast.success('Added to wishlist');
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
    toast.success('Removed from wishlist');
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
