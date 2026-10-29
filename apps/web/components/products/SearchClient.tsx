'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Search, X, Sparkles } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface Props {
  query: string;
}

function parseSearchTerm(raw: string): string {
  if (!raw) return '';
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
    const trimmed = raw.trim();
    if (trimmed.toLowerCase().startsWith('filter=')) {
      return trimmed.substring(7).trim();
    }
    return trimmed;
  }
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
  const [inputQuery, setInputQuery] = useState(() => parseSearchTerm(query));
  const debouncedQuery = useDebounce(inputQuery.trim(), 250);

  useEffect(() => {
    setInputQuery(parseSearchTerm(query));
  }, [query]);

  // Dedicated backend ILIKE search route for products matching name, description, tags
  const { data: searchData, isLoading: loading } = api.products.search.useQuery({
    query: debouncedQuery,
    limit: 48,
  });

  // Dedicated backend pg_trgm suggestions route for related tags and categories
  const { data: suggestionsData } = api.products.suggestions.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 }
  );

  const matchedProducts = searchData?.items || [];
  const relatedCategories = suggestionsData?.categories || [];
  const relatedTags = suggestionsData?.tags || [];

  return (
    <div className="w-full bg-[#FAF9F5] text-zinc-900 min-h-screen pt-32 pb-24 font-sans relative overflow-hidden">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF5E36]/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Header with In-page Search Bar */}
        <div className="border-b border-zinc-200/60 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-3">
              <LotusIcon className="w-5 h-5 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold">Catalog Search</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Search Results
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm font-light mt-2">
              Showing matching bespoke creations for: <span className="font-semibold text-zinc-800">&ldquo;{debouncedQuery || 'All items'}&rdquo;</span>
            </p>

            {/* Interactive Search Bar with Debounce */}
            <div className="mt-4 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search by ensemble name, fabric description, or tags..."
                className="w-full bg-white border border-zinc-200 rounded-full pl-11 pr-10 py-3 text-sm outline-none focus:border-[#FF5E36] focus:ring-2 focus:ring-[#FF5E36]/20 transition-all shadow-sm text-zinc-800"
              />
              {inputQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Related tags & categories from pg_trgm suggestions */}
            {(relatedCategories.length > 0 || relatedTags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF5E36]" /> Suggestions:
                </span>
                {relatedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInputQuery(cat)}
                    className="text-[10px] font-semibold bg-white border border-zinc-200 hover:border-[#FF5E36] hover:text-[#FF5E36] text-zinc-700 px-2.5 py-1 rounded-full transition-colors shadow-2xs"
                  >
                    {cat}
                  </button>
                ))}
                {relatedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setInputQuery(tag)}
                    className="text-[10px] bg-orange-50/60 border border-orange-100 hover:border-[#FF5E36] text-[#FF5E36] px-2.5 py-1 rounded-full transition-colors shadow-2xs"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
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
              We couldn&apos;t find any bespoke items matching &ldquo;{debouncedQuery || inputQuery}&rdquo;. Try exploring our collections or resetting your search.
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
