'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client/react';
import { useInfiniteProductScroll } from '@/hooks/useInfiniteProductScroll';
import { ShopHeader } from './shop/ShopHeader';
import { ShopCategoryNav } from './shop/ShopCategoryNav';
import { ShopToolbar } from './shop/ShopToolbar';
import { ShopFiltersDrawer } from './shop/ShopFiltersDrawer';
import { InfiniteProductGrid } from './shop/InfiniteProductGrid';

export const CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear',
];

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category');
  const initialFilter = searchParams.get('filter') as 'new' | 'bestseller' | 'all' | null;

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [activeFilter, setActiveFilter] = useState<'new' | 'bestseller' | 'all' | null>(initialFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sorting & local refinement state
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [hasSetMaxPrice, setHasSetMaxPrice] = useState(false);

  // 1. Fetch categories dynamically from API route: api.products.getCategories
  const { data: apiCategories = [] } = api.products.getCategories.useQuery();

  // Combine default boutique categories with database categories
  const dynamicCategories = useMemo(() => {
    return Array.from(new Set([...CATEGORIES, ...(apiCategories || [])]));
  }, [apiCategories]);

  // Map sort UI selection to backend sortBy enum
  const apiSortBy = useMemo(() => {
    if (sortBy === 'price-low-high') return 'price-asc';
    if (sortBy === 'price-high-low') return 'price-desc';
    if (sortBy === 'newest') return 'newest';
    return 'name-asc';
  }, [sortBy]);

  // 2. Batched data fetching with Infinite Scroll Hook (12 items per batch: 10-15 items)
  const {
    products: batchedProducts,
    totalCount,
    hasMore,
    isLoadingInitial,
    isFetchingNextBatch,
    loadNextBatch,
    sentinelRef,
  } = useInfiniteProductScroll({
    category: activeCategory || undefined,
    filter: activeFilter || undefined,
    sortBy: apiSortBy,
    batchSize: 12,
  });

  // Extract available color options and maximum price from currently loaded products
  const availableColors = useMemo(() => {
    return Array.from(
      new Set(
        batchedProducts.flatMap((p) => p.variants?.map((v) => v.color) || []).filter(Boolean)
      )
    ).slice(0, 10);
  }, [batchedProducts]);

  const maxLoadedPrice = useMemo(() => {
    if (batchedProducts.length === 0) return 50000;
    const max = Math.max(...batchedProducts.map((p) => p.price || 0));
    return max > 0 ? max : 50000;
  }, [batchedProducts]);

  useEffect(() => {
    if (batchedProducts.length > 0 && !hasSetMaxPrice) {
      setPriceRange(maxLoadedPrice);
      setHasSetMaxPrice(true);
    }
  }, [batchedProducts, hasSetMaxPrice, maxLoadedPrice]);

  // Sync state when URL query params change
  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    setActiveFilter((searchParams.get('filter') as any) || null);
  }, [searchParams]);

  const handleCategorySelect = (catSlug: string | null) => {
    if (catSlug) {
      router.push(`/shop?category=${catSlug}`);
    } else {
      router.push('/shop');
    }
  };

  const handleFilterSelect = (filterVal: string | null) => {
    if (filterVal) {
      router.push(`/shop?filter=${filterVal}`);
    } else {
      router.push('/shop');
    }
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetAllFilters = () => {
    router.push('/shop');
    setActiveCategory(null);
    setActiveFilter(null);
    setSelectedColors([]);
    setPriceRange(maxLoadedPrice);
    setSortBy('featured');
  };

  // Client-side filtering for color and price threshold on loaded batches
  const displayedProducts = useMemo(() => {
    let list = batchedProducts;
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        p.variants?.some((v) => selectedColors.includes(v.color) && Number(v.stock) > 0)
      );
    }
    if (priceRange < maxLoadedPrice) {
      list = list.filter((p) => Number(p.price || 0) <= priceRange);
    }
    return list;
  }, [batchedProducts, selectedColors, priceRange, maxLoadedPrice]);

  const hasActiveFilters = Boolean(
    activeFilter ||
    selectedColors.length > 0 ||
    priceRange < maxLoadedPrice ||
    sortBy !== 'featured'
  );

  return (
    <div className="w-full bg-white text-zinc-800 min-h-screen font-sans pb-24">
      {/* 1. Editorial Header Component */}
      <ShopHeader
        activeCategory={activeCategory}
        activeFilter={activeFilter}
        displayedCount={displayedProducts.length}
        totalCategories={dynamicCategories.length}
      />

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-6 w-full">
        {/* 2. Category Nav Component */}
        <ShopCategoryNav
          categories={dynamicCategories}
          activeCategory={activeCategory}
          activeFilter={activeFilter}
          onSelectCategory={handleCategorySelect}
          onSelectFilter={handleFilterSelect}
        />

        {/* 3. Toolbar Component */}
        <ShopToolbar
          loadedCount={displayedProducts.length}
          totalCount={totalCount}
          hasMore={hasMore}
          isFilterOpen={isFilterOpen}
          hasActiveFilters={hasActiveFilters}
          onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
          onResetFilters={resetAllFilters}
        />

        {/* 4. Collapsible Filters Drawer Component */}
        {isFilterOpen && (
          <ShopFiltersDrawer
            activeFilter={activeFilter}
            onSelectFilter={handleFilterSelect}
            availableColors={availableColors}
            selectedColors={selectedColors}
            onToggleColor={toggleColor}
            priceRange={priceRange}
            maxPrice={maxLoadedPrice}
            onPriceChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* 5. Infinite Scroll Product Grid Component */}
        <InfiniteProductGrid
          products={displayedProducts}
          isLoadingInitial={isLoadingInitial}
          isFetchingNextBatch={isFetchingNextBatch}
          hasMore={hasMore}
          onResetFilters={resetAllFilters}
          sentinelRef={sentinelRef}
          onManualLoadMore={loadNextBatch}
        />
      </section>
    </div>
  );
}
