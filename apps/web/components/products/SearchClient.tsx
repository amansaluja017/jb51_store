'use client';

import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface Props {
  query: string;
}

// Lotus Icon branding element
const LotusIcon = ({ className = "w-6 h-6 text-[#FF5E36]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

export function SearchClient({ query }: Props) {
  // Extract search term from potential "filter=..." prefix
  const searchTerm = query.startsWith('filter=') ? query.substring(7) : query;
  const decodedSearchTerm = decodeURIComponent(searchTerm).trim();

  const { data: searchData, isLoading: loading } = api.products.getPaginated.useQuery({
    search: decodedSearchTerm || undefined,
    limit: 48,
  });

  const matchedProducts = searchData?.items || [];

  return (
    <div className="w-full bg-[#FAF9F5] text-zinc-900 min-h-screen pt-32 pb-24 font-sans relative overflow-hidden">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF5E36]/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Header */}
        <div className="border-b border-zinc-200/60 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <LotusIcon className="w-5 h-5 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold">Atelier Search</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Search Results
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm font-light mt-2">
              Showing results for: <span className="font-semibold text-zinc-800">&ldquo;{decodedSearchTerm}&rdquo;</span>
            </p>
          </div>
          <p className="text-zinc-400 text-[10px] tracking-wider uppercase font-bold">
            {matchedProducts.length} {matchedProducts.length === 1 ? 'Design' : 'Designs'} Found
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-3 w-full">
                <div className="aspect-[3/4] w-full bg-zinc-100 rounded-3xl border border-zinc-200/50" />
                <div className="h-4 bg-zinc-100 rounded-md w-2/3 mt-2" />
                <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : matchedProducts.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center max-w-md mx-auto">
            <Search className="w-12 h-12 text-[#FF5E36] mb-4 opacity-80" />
            <h2 className="font-serif text-2xl font-bold mb-3 text-zinc-900">No Ensembles Found</h2>
            <p className="text-zinc-500 text-sm max-w-sm mb-8 font-light leading-relaxed">
              We couldn&apos;t find any bespoke items matching &ldquo;{decodedSearchTerm}&rdquo;. Try exploring our collections or resetting your search.
            </p>
            <Link
              href="/shop"
              className="bg-[#FF5E36] hover:bg-[#E04D27] text-white py-4 px-8 text-xs tracking-[0.2em] uppercase transition-all duration-300 font-bold rounded-full shadow-md"
            >
              Explore Full Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {matchedProducts.map(product => (
              <div key={product.id} className="search-product-card w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
