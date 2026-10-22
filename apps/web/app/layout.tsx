import type {Metadata} from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Caveat, Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/lib/trpc/client/react';

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

export const metadata: Metadata = {
  title: {
    default: "JB51 | Punjabi Suits, Premium Suits & Best Women Suits in Kaithal",
    template: "%s | JB51 - Premium Women's Suits",
  },
  description:
    "Discover JB51 — home of premium suits, designer Punjabi suits, and the best women suits for women in Kaithal. Shop handcrafted ethnic wear, boutique suits, and luxury festive collections.",
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
  ],
  authors: [{ name: 'JB51' }],
  creator: 'JB51',
  publisher: 'JB51',
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
    title: "JB51 | Punjabi Suits, Premium Suits & Best Women Suits in Kaithal",
    description:
      "Explore the finest Punjabi suits, premium women's suits, and boutique ethnic wear in Kaithal at JB51. Crafted for elegance, luxury, and comfort.",
    type: 'website',
    locale: 'en_IN',
    siteName: 'JB51',
  },
  twitter: {
    card: 'summary_large_image',
    title: "JB51 | Best Punjabi Suits & Premium Women Suits in Kaithal",
    description:
      "Discover designer Punjabi suits, premium women's suits, and luxury ethnic wear in Kaithal at JB51.",
  },
};


import { WishlistProvider } from '@/context/WishlistContext';
import { cn } from "@/lib/utils";
import { PageTransition } from '@/components/layout/PageTransition';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({children}: {children: React.ReactNode}) {
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
        <TRPCReactProvider>
          <WishlistProvider>
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
      </body>
    </html>
  );
}
