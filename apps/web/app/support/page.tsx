import type { Metadata } from 'next';
import { SupportClient } from '@/components/support/SupportClient';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Client Services & Concierge | JB51',
  description:
    'Connect with JB51 concierge for custom measurements, styling consultations, bespoke tailoring requests, and order status tracking.',
  keywords: [
    'JB51 support',
    'store concierge',
    'custom sizing consultation',
    'bespoke suit fitting',
    'customer service kaithal',
    'punjabi suit styling',
  ],
  alternates: {
    canonical: `${SITE_URL}/support`,
  },
  openGraph: {
    title: 'Client Services & Concierge | JB51',
    description:
      'Connect with JB51 concierge for custom measurements, styling consultations, bespoke tailoring requests, and order status tracking.',
    url: `${SITE_URL}/support`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'JB51 Concierge & Client Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Client Services & Concierge | JB51',
    description:
      'Connect with JB51 concierge for custom measurements, styling consultations, bespoke tailoring requests, and order status tracking.',
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
};

export default function SupportPage() {
  return <SupportClient />;
}
