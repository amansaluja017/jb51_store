import { Suspense } from 'react';
import { ShopClient } from '@/components/products/ShopClient';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: "Shop Designer Punjabi Suits, Silk Co-ords & Luxury Suits | JB51",
  description:
    "Explore our complete catalog of handcrafted Punjabi suits, pure Chanderi silk co-ords, luxury velvet edits, and bespoke festive wear in Kaithal.",
  keywords: [
    'punjabi suits',
    'premium suits',
    'best women suits for women',
    'best women suits for women in kaithal',
    'buy punjabi suits',
    'ladies suits kaithal',
    'silk co-ords',
    'anarkali suits',
    'velvet edit',
    'formal suits',
    'occasion wear',
  ],
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: "Shop Designer Punjabi Suits & Luxury Ethnic Wear | JB51",
    description:
      "Explore handcrafted Punjabi suits, pure Chanderi silk co-ords, and luxury velvet ensembles at JB51.",
    url: `${SITE_URL}/shop`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'JB51 Complete Suits Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Shop Designer Punjabi Suits & Luxury Ethnic Wear | JB51",
    description:
      "Explore handcrafted Punjabi suits, pure Chanderi silk co-ords, and luxury velvet ensembles at JB51.",
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
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
