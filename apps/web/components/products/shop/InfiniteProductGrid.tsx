import React from 'react';
import { type Product } from '@repo/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { LotusIcon } from './ShopHeader';
import { Sparkles, Loader2 } from 'lucide-react';

interface InfiniteProductGridProps {
  products: Product[];
  isLoadingInitial: boolean;
  isFetchingNextBatch: boolean;
  hasMore: boolean;
  onResetFilters: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
  onManualLoadMore: () => void;
}

export function InfiniteProductGrid({
  products,
  isLoadingInitial,
  isFetchingNextBatch,
  hasMore,
  onResetFilters,
  sentinelRef,
  onManualLoadMore,
}: InfiniteProductGridProps) {
  // Skeleton card component
  const SkeletonCard = () => (
    <div className="animate-pulse flex flex-col gap-3 w-full">
      <div className="aspect-[3/4] w-full bg-zinc-100 rounded-3xl border border-zinc-200/50" />
      <div className="h-4 bg-zinc-100 rounded-md w-2/3 mt-2" />
      <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
    </div>
  );

  return (
    <div className="w-full product-grid-container">
      {/* 1. Initial Loading State */}
      {isLoadingInitial ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {[...Array(12)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* 2. Product Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {products.map((product) => (
              <div key={product.id} className="product-card-wrapper w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* 3. Empty State */}
          {products.length === 0 && (
            <div className="text-center py-20 border border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50 my-10 max-w-lg mx-auto">
              <LotusIcon className="w-12 h-12 mx-auto text-[#FF5E36] mb-4" />
              <h3 className="font-serif text-xl text-zinc-900 mb-2 font-medium">No creations match filters</h3>
              <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed font-light">
                We couldn&apos;t find any designs matching your refinement profile. Select another category or reset refinements.
              </p>
              <Button
                onClick={onResetFilters}
                className="bg-[#FF5E36] hover:bg-[#E04D27] text-white rounded-full h-[46px] px-7"
              >
                Reset Refinements
              </Button>
            </div>
          )}

          {/* 4. Subsequent Batch Loading Indicator & Skeletons */}
          {isFetchingNextBatch && (
            <div className="mt-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Loader2 className="w-5 h-5 text-[#FF5E36] animate-spin" />
                <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">
                  Fetching next batch of creations...
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={`next-${i}`} />
                ))}
              </div>
            </div>
          )}

          {/* 5. Infinite Scroll Sentinel Element */}
          {hasMore && !isLoadingInitial && (
            <div ref={sentinelRef} className="w-full py-10 flex flex-col items-center justify-center">
              <Button
                onClick={onManualLoadMore}
                variant="outline"
                disabled={isFetchingNextBatch}
                className="text-xs uppercase tracking-widest rounded-full px-6 py-2 border-zinc-200 text-zinc-600 hover:border-[#FF5E36] hover:text-[#FF5E36] transition-all cursor-pointer"
              >
                {isFetchingNextBatch ? 'Loading...' : 'Load Next Batch'}
              </Button>
            </div>
          )}

          {/* 6. End of Collection reached notice */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-16 flex flex-col items-center justify-center border-t border-zinc-100 mt-16 select-none">
              <div className="w-10 h-10 rounded-full bg-[#FF5E36]/10 flex items-center justify-center text-[#FF5E36] mb-3">
                <Sparkles size={18} />
              </div>
              <h4 className="font-serif text-lg font-bold text-zinc-800 mb-1">
                You&apos;ve explored all {products.length} bespoke creations
              </h4>
              <p className="text-zinc-400 text-xs font-light max-w-sm">
                Each suit is custom handcrafted in our Kaithal workshop. Inquire with our master stylists for personalized bespoke requests.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
