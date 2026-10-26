import { Suspense } from 'react';
import { SearchClient } from '@/components/products/SearchClient';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    query: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { query } = await params;
  const searchTerm = query.startsWith('filter=') ? query.substring(7) : query;
  const decodedSearchTerm = decodeURIComponent(searchTerm);

  return {
    title: `Search: "${decodedSearchTerm}" | JB51`,
    description: `Browse custom handcrafted designs and tailored Punjabi suits matching "${decodedSearchTerm}" at JB51.`,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${SITE_URL}/search/${query}`,
    },
    openGraph: {
      title: `Search: "${decodedSearchTerm}" | JB51`,
      description: `Browse custom handcrafted designs and tailored Punjabi suits matching "${decodedSearchTerm}".`,
      url: `${SITE_URL}/search/${query}`,
      siteName: 'JB51',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Search: "${decodedSearchTerm}" | JB51`,
      description: `Browse custom handcrafted designs and tailored Punjabi suits matching "${decodedSearchTerm}".`,
    },
  };
}

export default async function SearchPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center font-serif text-2xl bg-[#FAF9F5] text-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF5E36] border-t-transparent animate-spin" />
            <span>Searching catalog...</span>
          </div>
        </div>
      }>
        <SearchClient query={resolvedParams.query} />
      </Suspense>
    </div>
  );
}
