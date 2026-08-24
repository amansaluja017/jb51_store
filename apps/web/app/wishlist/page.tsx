import { Suspense } from 'react';
import { WishlistClient } from '@/components/products/WishlistClient';

export const metadata = {
  title: 'Wishlist | JB51 Premium Suits',
  description: 'Your curated list of premium women\'s suits, blazers, and formalwear.',
};

export default function WishlistPage() {
  return (
    <div className="w-full bg-brand-ivory">
      <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif text-2xl bg-brand-ivory">Loading wishlist...</div>}>
        <WishlistClient />
      </Suspense>
    </div>
  );
}
