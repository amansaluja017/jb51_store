import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: "JB51 | Designer Punjabi Suits, Luxury Handlooms & Occasion Wear",
  description:
    "Explore JB51 — home of luxury Punjabi suits, pure Chanderi silk co-ords, royal velvet edits, and bespoke women's suits in Kaithal. Handcrafted heritage since 1951.",
  keywords: [
    'punjabi suits',
    'premium suits',
    'best women suits for women',
    'best women suits for women in kaithal',
    'punjabi suits in kaithal',
    'ladies suits in kaithal',
    'designer punjabi suits',
    'boutique suits kaithal',
    'best suits shop in kaithal',
    'luxury women suits',
    'salwar suits for women',
    'ethnic wear for women',
    'chanderi silk suits',
    'anarkali suits',
    'velvet suits',
    'party wear punjabi suits',
    'JB51 suits',
    'JB51 store Kaithal',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "JB51 | Designer Punjabi Suits, Luxury Handlooms & Occasion Wear",
    description:
      "Explore JB51's exquisite collection of handcrafted Punjabi suits, pure Chanderi silk co-ords, royal velvet edits, and bespoke festive ensembles.",
    url: SITE_URL,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'JB51 Signature Silhouettes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "JB51 | Designer Punjabi Suits, Luxury Handlooms & Occasion Wear",
    description:
      "Explore JB51's exquisite collection of handcrafted Punjabi suits, pure Chanderi silk co-ords, royal velvet edits, and bespoke festive ensembles.",
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
};

export default function Home() {
  return <HomeClient />;
}
