import React from 'react';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';

export default function ProductLoading() {
  return (
    <div className="bg-white min-h-screen text-zinc-800">
      <div>
        {/* 1. Breadcrumbs / Navigation Back Row */}
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-36 w-full flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-200 rounded-full animate-pulse" />
            <div className="w-24 h-3 bg-zinc-200 rounded-full animate-pulse" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-10 h-2.5 bg-zinc-200 rounded-full animate-pulse" />
            <span className="text-zinc-300 text-xs">•</span>
            <div className="w-10 h-2.5 bg-zinc-200 rounded-full animate-pulse" />
            <span className="text-zinc-300 text-xs">•</span>
            <div className="w-16 h-2.5 bg-[#FF5E36]/30 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Main Product Showcase */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 w-full flex flex-col lg:flex-row items-start gap-12 lg:gap-16 relative">
          
          {/* Left Column: Asymmetrical Editorial Image Gallery */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-6 relative z-20">
            {/* Thumbnails list */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 shrink-0 select-none pb-2 md:pb-0">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] w-16 md:w-full shrink-0 border-2 border-zinc-200 rounded-xl overflow-hidden bg-zinc-100 animate-pulse"
                />
              ))}
            </div>

            {/* Main Visual Display */}
            <div className="relative flex-1 aspect-[3/4] select-none w-full">
              <div className="relative aspect-[3/4] w-full bg-zinc-100 border border-zinc-200 rounded-3xl overflow-hidden shadow-sm animate-pulse">
                {/* Gold frame accent */}
                <div className="absolute inset-3.5 border border-zinc-200/50 rounded-2xl pointer-events-none" />

                {/* Status Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="w-20 h-5 bg-[#FF5E36]/25 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tailored Description & Custom Sizing Panel */}
          <div className="w-full lg:w-2/5 flex flex-col relative z-10">
            {/* Tagline */}
            <div className="w-24 h-3 bg-zinc-200 rounded-full mb-3 animate-pulse" />

            {/* Product Title */}
            <div className="space-y-2 mb-4">
              <div className="w-4/5 h-8 md:h-10 bg-zinc-200 rounded-xl animate-pulse" />
              <div className="w-3/5 h-8 md:h-10 bg-zinc-200 rounded-xl animate-pulse" />
            </div>

            {/* Attributes Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <div className="w-32 h-6 bg-[#FF5E36]/15 border border-[#FF5E36]/20 rounded-full animate-pulse" />
              <div className="w-28 h-6 bg-emerald-500/15 border border-emerald-500/20 rounded-full animate-pulse" />
            </div>

            {/* Pricing Block */}
            <div className="flex items-baseline gap-3 mb-5 flex-wrap">
              <div className="w-32 h-9 bg-zinc-200 rounded-xl animate-pulse" />
              <div className="w-20 h-6 bg-zinc-150 rounded-md animate-pulse" />
              <div className="w-28 h-5 bg-emerald-500/15 rounded-md animate-pulse" />
            </div>

            {/* Editorial Divider */}
            <div className="border-t border-zinc-100 my-2" />

            {/* Color Selection Pill Swatches */}
            <div className="mb-5 border-t border-zinc-100 pt-5">
              <div className="w-24 h-3 bg-zinc-200 rounded-full mb-3 animate-pulse" />
              <div className="flex items-center gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center animate-pulse"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-zinc-200" />
                  </div>
                ))}
              </div>
              <div className="w-48 h-3 bg-emerald-500/15 rounded-full mt-3 animate-pulse" />
            </div>

            {/* Inquiry Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-emerald-600/15 border border-emerald-600/25 rounded-full animate-pulse" />
                <div className="h-12 bg-zinc-900/10 border border-zinc-900/20 rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-full bg-zinc-100 border border-zinc-200 rounded-full animate-pulse" />
            </div>

            {/* Karigar Custom Fitting Card */}
            <div className="mb-6 p-6 rounded-3xl border border-zinc-200 bg-zinc-50/60 relative overflow-hidden animate-pulse">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5E36]/10 border border-[#FF5E36]/20" />
                <div className="w-36 h-3 bg-[#FF5E36]/20 rounded-full" />
              </div>
              <div className="w-48 h-5 bg-zinc-200 rounded-lg mb-2" />
              <div className="w-full h-3 bg-zinc-150 rounded mb-1.5" />
              <div className="w-5/6 h-3 bg-zinc-150 rounded mb-3" />
              <div className="w-36 h-3 bg-[#FF5E36]/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* 2. Return and Exchange Skeleton (Reference 2: 2 Days Return, 10 Days Exchange, Cash On Delivery) */}
        <section className="border-y border-zinc-200/80 bg-white py-8 mb-16 w-full">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-6 md:gap-12 text-center items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 mb-2.5" />
                  <div className="w-24 h-3.5 bg-zinc-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Product Description and All Sections Skeleton (Reference 1: Description, Specs, Supplier, Returns) */}
        <section className="max-w-5xl mx-auto px-6 mb-20 w-full">
          <div className="border-t border-zinc-200 divide-y divide-zinc-200">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-5 flex justify-between items-center animate-pulse">
                <div className="w-40 h-4 bg-zinc-200 rounded-md" />
                <div className="w-4 h-4 bg-zinc-200 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Editorial Craftsmanship Banner Skeleton */}
        <div className="max-w-7xl mx-auto px-6 mb-24 mt-12 w-full">
          <div className="min-h-[280px] rounded-[2.5rem] bg-zinc-100/80 border border-zinc-200/80 p-8 md:p-12 flex flex-col justify-center animate-pulse relative overflow-hidden">
            <div className="w-28 h-3 bg-zinc-200 rounded-full mb-4" />
            <div className="w-3/4 max-w-lg h-8 md:h-12 bg-zinc-200 rounded-xl mb-4" />
            <div className="w-full max-w-xl h-3.5 bg-zinc-200/70 rounded mb-2" />
            <div className="w-4/5 max-w-lg h-3.5 bg-zinc-200/70 rounded mb-6" />
            <div className="w-44 h-11 bg-zinc-200 rounded-full" />
          </div>
        </div>

        {/* 3. Similar Products Section Skeleton */}
        <div className="border-t border-zinc-200/50 bg-zinc-50/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <div className="w-36 h-3 bg-[#FF5E36]/25 rounded-full mb-2 animate-pulse" />
                <div className="w-48 h-8 bg-zinc-200 rounded-xl animate-pulse" />
              </div>
              <div className="w-64 h-4 bg-zinc-200 rounded-md animate-pulse" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
