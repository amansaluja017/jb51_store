import { Suspense } from 'react';
import { WishlistClient } from '@/components/products/WishlistClient';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Curated Wishlist | JB51',
  description: 'Review and manage your saved bespoke Punjabi suits, handloom ensembles, and luxury silhouettes at JB51.',
  alternates: {
    canonical: `${SITE_URL}/wishlist`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'My Curated Wishlist | JB51',
    description: 'Review and manage your saved bespoke Punjabi suits, handloom ensembles, and luxury silhouettes at JB51.',
    url: `${SITE_URL}/wishlist`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Curated Wishlist | JB51',
    description: 'Review and manage your saved bespoke Punjabi suits and luxury silhouettes.',
  },
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
