import React from 'react';
import { cn } from '@/lib/utils';

interface ShopFiltersDrawerProps {
  activeFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
  availableColors: string[];
  selectedColors: string[];
  onToggleColor: (color: string) => void;
  priceRange: number;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ShopFiltersDrawer({
  activeFilter,
  onSelectFilter,
  availableColors,
  selectedColors,
  onToggleColor,
  priceRange,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
}: ShopFiltersDrawerProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative overflow-hidden shadow-xl animate-scale-up text-zinc-800">
      {/* Overlay glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5E36]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Column 1: Curation Filters */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
          Curation Drops
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectFilter(null)}
            className={cn(
              "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
              !activeFilter ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
            )}
          >
            All Outfits
          </button>
          <button
            onClick={() => onSelectFilter('new')}
            className={cn(
              "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
              activeFilter === 'new' ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
            )}
          >
            New Arrivals
          </button>
          <button
            onClick={() => onSelectFilter('bestseller')}
            className={cn(
              "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
              activeFilter === 'bestseller' ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
            )}
          >
            Bestsellers
          </button>
        </div>
      </div>

      {/* Column 2: Color Filter */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
          Filter by Color
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {availableColors.length > 0 ? (
            availableColors.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => onToggleColor(color)}
                  className={cn(
                    "px-2.5 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#FF5E36] text-white border-[#FF5E36] shadow-sm"
                      : "border-zinc-200 text-zinc-600 hover:border-[#FF5E36] bg-white/50"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Filter by color ${color}`}
                >
                  {color}
                </button>
              );
            })
          ) : (
            <span className="text-[10px] text-zinc-400">All fabric tones available</span>
          )}
        </div>
      </div>

      {/* Column 3: Price Limit Slider */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
          Price Limit
        </h2>
        <div className="flex flex-col gap-3 pt-1">
          <input
            id="price-range-slider"
            name="priceRange"
            aria-label="Filter by maximum price"
            type="range"
            min={0}
            max={Math.max(1000, maxPrice)}
            step={1000}
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-[#FF5E36] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
            <span>Up to:</span>
            <span className="text-[#FF5E36] font-extrabold">
              {priceRange.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Column 4: Sort Order */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
          Sort Order
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { value: "featured", label: "Featured Curation" },
            { value: "price-low-high", label: "Price: Low to High" },
            { value: "price-high-low", label: "Price: High to Low" },
            { value: "newest", label: "Newest Arrivals" }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
                sortBy === opt.value ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
