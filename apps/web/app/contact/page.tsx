import type { Metadata } from 'next';
import { SupportClient } from '@/components/support/SupportClient';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact Us | JB51 Store',
  description:
    'Contact the JB51 concierge team for bridal fittings, custom tailoring, styling advice, and order inquiries.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Us | JB51 Store',
    description:
      'Contact the JB51 concierge team for bridal fittings, custom tailoring, styling advice, and order inquiries.',
    url: `${SITE_URL}/contact`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ContactPage() {
  return <SupportClient />;
}
