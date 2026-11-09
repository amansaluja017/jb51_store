'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { type Product } from '@repo/products';

interface TrendingGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function TrendingGrid({ products = [], isLoading = false }: TrendingGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter listed homepage enabled products (or fallback to listed products if none are flagged)
  const displayProducts = (() => {
    const listed = (products || []).filter((p) => p.isListed !== false);
    const featured = listed.filter((p) => Boolean(p.featured));
    return featured.length > 0 ? featured : listed;
  })();

  const showSkeleton = isLoading || displayProducts.length === 0;

  // Check scroll boundary to enable/disable navigation buttons
  const checkScrollBoundaries = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollBoundaries();
    container.addEventListener('scroll', checkScrollBoundaries, { passive: true });
    window.addEventListener('resize', checkScrollBoundaries, { passive: true });

    return () => {
      container.removeEventListener('scroll', checkScrollBoundaries);
      window.removeEventListener('resize', checkScrollBoundaries);
    };
  }, [checkScrollBoundaries, displayProducts.length]);

  // Smooth scroll handler for Prev / Next action
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll by width of one card + gap (or client width on small screens)
    const firstCard = container.querySelector<HTMLElement>('[data-carousel-card]');
    const scrollAmount = firstCard
      ? firstCard.offsetWidth + 24
      : Math.round(container.clientWidth * 0.75);

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="curated-silhouettes"
      className="py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full bg-zinc-50 rounded-[2.5rem] relative overflow-hidden my-12 border border-zinc-100/80 shadow-sm"
    >
      {/* Background Watermark */}
      <div className="absolute top-10 left-10 text-zinc-200/40 font-serif text-[120px] lg:text-[140px] select-none pointer-events-none hidden xl:block font-bold leading-none tracking-wider">
        COLLECTION
      </div>

      {/* Header with Title and Prev/Next Carousel Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold mb-2">
            <Sparkles size={13} className="text-[#FF5E36]" />
            HANDPICKED CURATION
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight">
            Curated Silhouettes
          </h2>
          <p className="text-zinc-500 text-sm mt-1 max-w-md hidden sm:block">
            Featured runway ensembles spotlighted directly from our atelier collection.
          </p>
        </div>

        {/* Carousel Prev & Next Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous products"
            className="w-11 h-11 rounded-full border border-zinc-200 bg-white/95 backdrop-blur text-zinc-800 flex items-center justify-center transition-all duration-300 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5E36]/40"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next products"
            className="w-11 h-11 rounded-full border border-zinc-200 bg-white/95 backdrop-blur text-zinc-800 flex items-center justify-center transition-all duration-300 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5E36]/40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="relative group/carousel z-10">
        {/* Floating Side Prev Button (visible on hover for large screens) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-zinc-200 text-zinc-800 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-zinc-950 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Floating Side Next Button (visible on hover for large screens) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-zinc-200 text-zinc-800 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-zinc-950 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {showSkeleton ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                data-carousel-card
                className="w-[82vw] xs:w-[72vw] sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start"
              >
                <ProductCardSkeleton />
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <div
                key={product.id}
                data-carousel-card
                className="w-[82vw] xs:w-[72vw] sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
