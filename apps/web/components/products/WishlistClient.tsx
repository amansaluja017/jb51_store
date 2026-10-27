'use client';

import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Heart } from 'lucide-react';

export function WishlistClient() {
  const { wishlist, fingerprint, isSyncing } = useWishlist();
  const { data: paginatedData, isLoading: loading } = api.products.getPaginated.useQuery({
    limit: 48,
  });
  const products = paginatedData?.items || [];

  // Filter products that are in the user's wishlist
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // Truncated display string for the browser fingerprint
  const shortFingerprint = fingerprint ? fingerprint.replace('bfp_', '').substring(0, 10) : '';

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-36 w-full min-h-[75vh]">
      {/* Header section with Editorial layout */}
      <div className="border-b border-brand-charcoal/10 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-script text-3xl text-brand-saffron block mb-1">
            My Curated Pieces
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-maroon">Wishlist</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {fingerprint && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200/80 text-[10px] text-zinc-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5E36]" />
              <span>
                Browser Sync: <span className="font-mono text-zinc-900 font-semibold">{shortFingerprint}</span>
              </span>
              {isSyncing && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] animate-ping ml-1" />
              )}
            </div>
          )}

          <p className="text-brand-brown/60 text-xs md:text-sm tracking-wider uppercase font-medium">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'Piece' : 'Pieces'} Saved
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3 w-full">
              <div className="aspect-[3/4] w-full bg-zinc-100 rounded-3xl border border-zinc-200/50" />
              <div className="h-4 bg-zinc-100 rounded-md w-2/3 mt-2" />
              <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
            </div>
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FF5E36]/10 flex items-center justify-center text-[#FF5E36] mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-3 text-zinc-900">Your Wishlist is Empty</h2>
          <p className="text-zinc-500 text-sm max-w-sm mb-8 font-light leading-relaxed">
            Explore our curated collections of premium women&apos;s suits, heritage handlooms, and luxury occasion wear to save your favorite ensembles.
          </p>
          <Link href="/shop" passHref legacyBehavior>
            <Button className="bg-[#FF5E36] hover:bg-[#E04D27] text-white py-4 px-8 text-xs tracking-[0.2em] uppercase transition-all duration-300 font-bold rounded-full shadow-md">
              Explore Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {wishlistedProducts.map((product) => (
            <div key={product.id} className="wishlist-card w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
