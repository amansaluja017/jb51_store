import React from 'react';
import { cn } from '@/lib/utils';

interface ShopCategoryNavProps {
  categories: string[];
  activeCategory: string | null;
  activeFilter: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
  onSelectFilter: (filter: string | null) => void;
}

export function ShopCategoryNav({
  categories,
  activeCategory,
  activeFilter,
  onSelectCategory,
  onSelectFilter,
}: ShopCategoryNavProps) {
  const slugifyCategory = (cat: string) =>
    cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 border-b border-zinc-100 mb-6 select-none">
      <button
        onClick={() => {
          onSelectCategory(null);
          onSelectFilter(null);
        }}
        className={cn(
          "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[#FF5E36] after:transition-all after:duration-300 after:ease-out",
          !activeCategory && !activeFilter
            ? "text-[#FF5E36] after:w-8 after:opacity-100"
            : "text-zinc-500 hover:text-[#FF5E36] hover:after:w-4 hover:after:opacity-50 after:w-0 after:opacity-0"
        )}
      >
        All Collections
      </button>
      {categories.map((cat) => {
        const catSlug = slugifyCategory(cat);
        const isActive = activeCategory === catSlug;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(catSlug)}
            className={cn(
              "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[#FF5E36] after:transition-all after:duration-300 after:ease-out",
              isActive
                ? "text-[#FF5E36] after:w-8 after:opacity-100"
                : "text-zinc-500 hover:text-[#FF5E36] hover:after:w-4 hover:after:opacity-50 after:w-0 after:opacity-0"
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
