'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/trpc/client/react';
import { toast } from 'sonner';
import { getBrowserFingerprint } from '@/lib/fingerprint';

interface WishlistContextType {
  wishlist: string[]; // array of product IDs
  fingerprint: string;
  isSyncing: boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const hasMergedServer = useRef<boolean>(false);

  // Background mutations
  const syncMutation = api.wishlist.sync.useMutation({
    onSuccess: (data) => {
      setIsSyncing(false);
      if (data?.productIds && Array.isArray(data.productIds)) {
        setWishlist(data.productIds);
      }
    },
    onError: (err) => {
      setIsSyncing(false);
      console.error('Background wishlist sync error:', err);
    },
  });

  const addMutation = api.wishlist.add.useMutation({
    onError: (err) => {
      console.error('Background wishlist add error:', err);
    },
  });

  const removeMutation = api.wishlist.remove.useMutation({
    onError: (err) => {
      console.error('Background wishlist remove error:', err);
    },
  });

  // Query server wishlist directly for this browser fingerprint
  const { data: serverWishlist } = api.wishlist.get.useQuery(
    { fingerprint },
    {
      enabled: Boolean(fingerprint && fingerprint.length > 0),
      staleTime: 5 * 60 * 1000,
    }
  );

  // 1. Initialize browser fingerprint and clean up any unnecessary legacy localStorage data
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Clean up unnecessary legacy localStorage keys
      try {
        localStorage.removeItem('jb51_wishlist');
        localStorage.removeItem('jb51_custom_categories');
      } catch (_) {}

      // Compute browser fingerprint for server-side persistence
      const fp = await getBrowserFingerprint();
      if (isMounted) {
        setFingerprint(fp);
        setIsInitialized(true);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Hydrate wishlist from server database for this browser fingerprint
  useEffect(() => {
    if (serverWishlist && !hasMergedServer.current && isInitialized) {
      hasMergedServer.current = true;
      if (Array.isArray(serverWishlist.productIds)) {
        setWishlist(serverWishlist.productIds);
      }
    }
  }, [serverWishlist, isInitialized]);

  const addToWishlist = useCallback(
    (productId: string) => {
      if (!productId) return;
      setWishlist((prev) => {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      });

      toast.success('Added to wishlist');

      if (fingerprint) {
        addMutation.mutate({ fingerprint, productId });
      }
    },
    [fingerprint, addMutation]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      if (!productId) return;
      setWishlist((prev) => prev.filter((id) => id !== productId));

      toast.success('Removed from wishlist');

      if (fingerprint) {
        removeMutation.mutate({ fingerprint, productId });
      }
    },
    [fingerprint, removeMutation]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      if (wishlist.includes(productId)) {
        removeFromWishlist(productId);
      } else {
        addToWishlist(productId);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        fingerprint,
        isSyncing,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
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
