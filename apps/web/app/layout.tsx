import type {Metadata} from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Caveat } from 'next/font/google';
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

import { PageTransitionProvider } from '@/components/layout/PageTransitionProvider';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable} ${caveat.variable}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans bg-brand-cream text-brand-brown">
        <TRPCReactProvider>
          <PageTransitionProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pt-24">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-center" />
          </PageTransitionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
