import { Suspense } from 'react';
import { ShopClient } from '@/components/products/ShopClient';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shop Punjabi Suits & Premium Women's Suits | JB51 Kaithal",
  description:
    "Explore our exclusive collection of Punjabi suits, premium women's suits, and boutique party wear in Kaithal. Unstitched, stitched, and luxury designer wear.",
  keywords: [
    'punjabi suits',
    'premium suits',
    'best women suits for women',
    'best women suits for women in kaithal',
    'buy punjabi suits',
    'ladies suits kaithal',
  ],
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
