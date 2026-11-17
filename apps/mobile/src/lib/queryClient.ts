import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client for mobile application
 * Provides centralized fetching, intelligent caching, automatic deduplication,
 * and unified loading/error lifecycle management.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data remains fresh for 1 minute
      gcTime: 10 * 60 * 1000, // Inactive cache retained for 10 minutes
      retry: 1, // Retry failed queries once before throwing error state
      refetchOnWindowFocus: false, // In mobile, rely on pull-to-refresh and route focus
      refetchOnReconnect: true, // Automatically re-sync when network reconnects
    },
    mutations: {
      retry: 0, // Do not auto-retry mutations to prevent duplicate writes
    },
  },
});

export const QUERY_KEYS = {
  products: {
    all: ['products', 'all'] as const,
    categories: ['products', 'categories'] as const,
    paginated: (params?: unknown) => ['products', 'paginated', params] as const,
  },
  inventory: {
    transactions: ['inventory', 'transactions'] as const,
    paginatedTransactions: (params?: unknown) => ['inventory', 'paginatedTransactions', params] as const,
    paginatedStock: (params?: unknown) => ['inventory', 'paginatedStock', params] as const,
  },
  customers: {
    all: ['customers', 'all'] as const,
    paginated: (params?: unknown) => ['customers', 'paginated', params] as const,
    history: (id: string) => ['customers', 'history', id] as const,
  },
  invoices: {
    all: ['invoices', 'all'] as const,
    paginated: (params?: unknown) => ['invoices', 'paginated', params] as const,
  },
  orders: {
    all: ['orders', 'all'] as const,
    paginated: (params?: unknown) => ['orders', 'paginated', params] as const,
  },
  credits: {
    all: ['credits', 'all'] as const,
    paginated: (params?: unknown) => ['credits', 'paginated', params] as const,
    metrics: ['credits', 'metrics'] as const,
  },
  analytics: {
    overview: (slug?: string) => ['analytics', 'overview', slug] as const,
    catalogueTelemetry: (params?: unknown) => ['analytics', 'catalogueTelemetry', params] as const,
  },
  inquiries: {
    paginated: (params?: unknown) => ['inquiries', 'paginated', params] as const,
  },
  reviews: {
    paginated: (params?: unknown) => ['reviews', 'paginated', params] as const,
  },
  siteConfig: {
    current: ['siteConfig', 'current'] as const,
  },
} as const;

export default queryClient;

