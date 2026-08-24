'use client';

import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { useEffect } from 'react';
import gsap from 'gsap';

export function WishlistClient() {
  const { wishlist } = useWishlist();
  const { data: products = [], isLoading: loading } = api.products.getAll.useQuery();

  // Filter products that are in the user's wishlist
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  useEffect(() => {
    if (!loading && wishlistedProducts.length > 0) {
      gsap.fromTo('.wishlist-card', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading, wishlistedProducts.length]);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-36 w-full min-h-[75vh]">
      <div className="border-b border-brand-charcoal/10 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-script text-3xl text-brand-saffron block mb-1">
            My Curated Pieces
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-maroon">Wishlist</h1>
        </div>
        <p className="text-brand-brown/60 text-xs md:text-sm tracking-wider uppercase font-medium">
          {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'Piece' : 'Pieces'} Saved
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] bg-brand-charcoal/5 animate-pulse" />
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center justify-center">
          <span className="text-4xl text-brand-saffron mb-4">✤</span>
          <h3 className="font-serif text-2xl mb-4 text-brand-maroon">Your Wishlist is Empty</h3>
          <p className="text-brand-brown/60 text-sm max-w-sm mb-8 font-light leading-relaxed">
            Explore our curated collections of premium women's suits, heritage designs, and luxury formalwear to add your favorite pieces.
          </p>
          <Link 
            href="/shop"
            className="bg-brand-maroon hover:bg-brand-burgundy text-brand-cream py-4 px-8 text-xs tracking-[0.2em] uppercase transition-colors font-medium border border-transparent"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
          {wishlistedProducts.map(product => (
            <div key={product.id} className="wishlist-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
