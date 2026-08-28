import { Suspense } from 'react';
import { SearchClient } from '@/components/products/SearchClient';

interface PageProps {
  params: Promise<{
    query: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { query } = await params;
  const searchTerm = query.startsWith('filter=') ? query.substring(7) : query;
  const decodedSearchTerm = decodeURIComponent(searchTerm);
  
  return {
    title: `Search: "${decodedSearchTerm}" | JB51 Premium Suits`,
    description: `Browse custom designs and tailored suits for "${decodedSearchTerm}".`,
  };
}

export default async function SearchPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center font-serif text-2xl bg-[#FAF9F5] text-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <span className="text-3xl text-[#FF5E36] animate-pulse">✦</span>
            <span>Searching atelier...</span>
          </div>
        </div>
      }>
        <SearchClient query={resolvedParams.query} />
      </Suspense>
    </div>
  );
}
