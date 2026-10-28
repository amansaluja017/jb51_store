import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Caveat, Geist } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { StoreAnalyticsTracker } from '@/components/layout/StoreAnalyticsTracker';
import { WishlistProvider } from '@/context/WishlistContext';
import { TRPCReactProvider } from '@/lib/trpc/client/react';
import { cn, SITE_URL } from '@/lib/utils';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  title: {
    default: "JB51 | Designer Punjabi Suits, Luxury Handlooms & Occasion Wear",
    template: "%s | JB51",
  },
  description:
    "Discover JB51 — home of luxury Punjabi suits, pure Chanderi silk co-ords, royal velvet edits, and bespoke women's suits in Kaithal. Handcrafted heritage since 1951.",
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
    'party wear punjabi suits',
    'JB51 suits',
    'JB51 store Kaithal',
    'chanderi silk suits',
    'anarkali suits',
    'velvet suits',
  ],
  authors: [{ name: 'JB51' }],
  creator: 'JB51',
  publisher: 'JB51',
  category: 'clothing',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "JB51 | Designer Punjabi Suits, Luxury Handlooms & Occasion Wear",
    description:
      "Explore the finest Punjabi suits, pure Chanderi silk co-ords, and bespoke boutique ethnic wear in Kaithal at JB51. Crafted for elegance, luxury, and comfort.",
    type: 'website',
    locale: 'en_IN',
    siteName: 'JB51',
    url: SITE_URL,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'JB51 Luxury Silhouettes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "JB51 | Best Punjabi Suits & Designer Ethnic Wear",
    description:
      "Discover designer Punjabi suits, bespoke women's suits, and luxury ethnic wear at JB51.",
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(playfair.variable, plusJakarta.variable, caveat.variable, "font-sans", geist.variable)}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans bg-brand-cream text-brand-brown">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZMV3P7PPRH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZMV3P7PPRH');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "name": "JB51",
              "url": SITE_URL,
              "description": "Discover JB51 — luxury designer Punjabi suits, pure Chanderi silk co-ords, and bespoke boutique suits in Kaithal.",
              "telephone": "+91 98765 43210",
              "email": "support@jb51.shop",
              "currenciesAccepted": "INR",
              "priceRange": "₹₹ - ₹₹₹₹",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Bazaar",
                "addressLocality": "Kaithal",
                "addressRegion": "Haryana",
                "postalCode": "136027",
                "addressCountry": "IN",
              },
            }),
          }}
        />
        <TRPCReactProvider>
          <WishlistProvider>
            <StoreAnalyticsTracker />
            <Navbar />
            <main className="flex-1 flex flex-col">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
            <Toaster position="bottom-center" />
          </WishlistProvider>
        </TRPCReactProvider>
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
      </body>
    </html>
  );
}
