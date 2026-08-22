import { Suspense } from 'react';
import { ShopClient } from '@/components/products/ShopClient';

export const metadata = {
  title: 'Shop | JB51 Premium Suits',
  description: 'Explore our collection of premium women\'s suits, blazers, and formalwear.',
};

export default function ShopPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif text-2xl">Loading collection...</div>}>
        <ShopClient />
      </Suspense>
    </div>
  );
}
