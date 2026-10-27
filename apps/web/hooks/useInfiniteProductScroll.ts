import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { api } from '@/lib/trpc/client/react';
import { type Product } from '@repo/products';

export interface UseInfiniteProductsOptions {
  category?: string | null;
  filter?: 'new' | 'bestseller' | 'all' | null;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'newest' | 'default' | null;
  inStockOnly?: boolean | null;
  search?: string | null;
  batchSize?: number;
}

export function useInfiniteProductScroll({
  category = null,
  filter = null,
  sortBy = 'name-asc',
  inStockOnly = false,
  search = null,
  batchSize = 12, // Fetches in batches of 10-15 products (12 fits 2, 3, and 4 column grids evenly)
}: UseInfiniteProductsOptions) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [accumulatedProducts, setAccumulatedProducts] = useState<Product[]>([]);
  const [isFetchingNext, setIsFetchingNext] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // tRPC paginated query for current batch page
  const { data: pageData, isLoading, isFetching } = api.products.getPaginated.useQuery(
    {
      category: category || undefined,
      filter: filter || undefined,
      sortBy: sortBy || 'name-asc',
      inStockOnly: inStockOnly || undefined,
      search: search || undefined,
      page: currentPage,
      limit: batchSize,
    },
    {
      staleTime: 60 * 1000,
      placeholderData: (prev) => prev,
    }
  );

  const total = pageData?.total ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  // Whenever search/filter/category/sort changes, reset to page 1 and clear accumulator
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedProducts([]);
  }, [category, filter, sortBy, inStockOnly, search]);

  // Append new batch items onto accumulator and deduplicate by product id
  useEffect(() => {
    if (pageData?.items) {
      setAccumulatedProducts((prev) => {
        if (currentPage === 1) {
          return pageData.items;
        }

        const existingIds = new Set(prev.map((p) => p.id));
        const newUniqueItems = pageData.items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newUniqueItems];
      });
      setIsFetchingNext(false);
    }
  }, [pageData, currentPage]);

  // Load next batch
  const loadNextBatch = useCallback(() => {
    if (hasMore && !isFetching && !isFetchingNext) {
      setIsFetchingNext(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching, isFetchingNext]);

  // Sentinel IntersectionObserver ref
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first && first.isIntersecting && hasMore && !isFetching && !isFetchingNext) {
            loadNextBatch();
          }
        },
        {
          rootMargin: '250px 0px', // Pre-fetch next batch before user reaches absolute bottom
          threshold: 0.1,
        }
      );

      observerRef.current.observe(node);
    },
    [isLoading, hasMore, isFetching, isFetchingNext, loadNextBatch]
  );

  return {
    products: accumulatedProducts,
    totalCount: total,
    totalPages,
    currentPage,
    hasMore,
    isLoadingInitial: isLoading && currentPage === 1 && accumulatedProducts.length === 0,
    isFetchingNextBatch: isFetchingNext || (isFetching && currentPage > 1),
    loadNextBatch,
    sentinelRef,
  };
}
