import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopToolbarProps {
  loadedCount: number;
  totalCount: number;
  hasMore: boolean;
  isFilterOpen: boolean;
  hasActiveFilters: boolean;
  onToggleFilter: () => void;
  onResetFilters: () => void;
}

export function ShopToolbar({
  loadedCount,
  totalCount,
  hasMore,
  isFilterOpen,
  hasActiveFilters,
  onToggleFilter,
  onResetFilters,
}: ShopToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-zinc-200 mb-8">
      {/* Stats */}
      <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
        Showing <span className="text-[#FF5E36] font-extrabold">{loadedCount}</span> of{' '}
        <span className="text-zinc-800 font-extrabold">{totalCount}</span> bespoke creations
        {hasMore && <span className="text-zinc-400 font-medium"> · Scroll down for more</span>}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Clear filters if active */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-[9px] tracking-widest uppercase underline underline-offset-4 text-[#FF5E36] hover:text-[#E04D27] font-extrabold transition-colors cursor-pointer"
          >
            Reset Refinements
          </button>
        )}

        {/* Refine Trigger Button */}
        <button
          onClick={onToggleFilter}
          className={cn(
            "flex items-center gap-2 text-[10px] tracking-widest uppercase font-extrabold px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-sm",
            isFilterOpen
              ? "bg-[#FF5E36] text-white border-[#FF5E36] shadow-[#FF5E36]/10"
              : "bg-white border-zinc-200 text-zinc-800 hover:border-[#FF5E36] hover:text-[#FF5E36]"
          )}
          aria-expanded={isFilterOpen}
        >
          <SlidersHorizontal size={12} />
          <span>Refine Selection</span>
        </button>
      </div>
    </div>
  );
}
