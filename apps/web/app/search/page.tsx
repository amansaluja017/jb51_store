import { Suspense } from 'react';
import { SearchClient } from '@/components/products/SearchClient';
import type { Metadata } from 'next';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    query?: string;
  }>;
}

function extractTerm(params: { q?: string; filter?: string; query?: string }): string {
  const raw = params.q || params.filter || params.query || '';
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (decoded.toLowerCase().startsWith('filter=')) {
      return decoded.substring(7).trim();
    }
    if (decoded.toLowerCase().startsWith('filter:')) {
      return decoded.substring(7).trim();
    }
    if (decoded.toLowerCase().startsWith('q=')) {
      return decoded.substring(2).trim();
    }
    return decoded;
  } catch {
    return raw.trim();
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const term = extractTerm(params);
  const title = term ? `Search: "${term}" | JB51` : 'Search Atelier Catalog | JB51';

  return {
    title,
    description: 'Browse custom handcrafted designs and tailored Punjabi suits at JB51.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cleanTerm = extractTerm(params);

  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center font-serif text-2xl bg-[#FAF9F5] text-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#FF5E36] border-t-transparent animate-spin" />
              <span>Searching catalog...</span>
            </div>
          </div>
        }
      >
        <SearchClient query={cleanTerm} />
      </Suspense>
    </div>
  );
}
