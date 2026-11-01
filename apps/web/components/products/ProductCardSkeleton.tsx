import React from 'react';
import { cn } from '@/lib/utils';

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-zinc-150 animate-pulse",
        className
      )}
    >
      {/* Media Image Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-zinc-100" />

      {/* Details Placeholder */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category */}
          <div className="h-2.5 bg-zinc-100 rounded w-1/4 mb-2" />
          {/* Title */}
          <div className="h-4 bg-zinc-100 rounded w-4/5 mb-1.5" />
          {/* Fabric */}
          <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100/60">
          <div className="h-4 bg-zinc-100 rounded w-1/3" />
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
