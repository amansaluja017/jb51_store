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
  title: 'JB51 | Premium Women\'s Suits & Formalwear',
  description: 'Quiet luxury and editorial fashion. Discover premium suits, blazers, and co-ords for the modern woman.',
  openGraph: {
    title: 'JB51 | Premium Women\'s Suits',
    description: 'Quiet luxury and editorial fashion. Discover premium suits, blazers, and co-ords for the modern woman.',
    type: 'website',
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
