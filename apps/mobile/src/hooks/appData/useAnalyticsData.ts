import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';
import {
  Product,
  AnalyticsOverviewData,
  ProductAnalyticsItem,
  ViewsAnalytics,
  ClicksAnalytics,
  ConversionAnalytics,
  ConversionFunnelAnalytics,
  ChannelRatioAnalytics,
  GrowthPulseAnalytics,
  PaymentModesAnalytics,
  DemandHighlightsAnalytics,
  InventorySummaryAnalytics,
  PaginatedCatalogueTelemetryResult,
  isProductInStock,
} from '../../types';

interface OverviewAggregatedResponse {
  overview?: AnalyticsOverviewData;
  viewsAnalytics?: ViewsAnalytics;
  clicksAnalytics?: ClicksAnalytics;
  conversionAnalytics?: ConversionAnalytics;
  funnelAnalytics?: ConversionFunnelAnalytics;
  channelRatioAnalytics?: ChannelRatioAnalytics;
  growthPulseAnalytics?: GrowthPulseAnalytics;
  paymentModesAnalytics?: PaymentModesAnalytics;
  demandHighlightsAnalytics?: DemandHighlightsAnalytics;
  catalogueTelemetryAnalytics?: ProductAnalyticsItem[];
  inventorySummaryAnalytics?: InventorySummaryAnalytics;
  allProductsAnalytics?: ProductAnalyticsItem[];
}

interface UseAnalyticsDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  products?: Product[];
  isAuthenticated: boolean;
  activeTab: string;
}

export function useAnalyticsData({
  trpcRequest,
  products,
  isAuthenticated,
  activeTab,
}: UseAnalyticsDataProps) {
  const [selectedAnalyticsSlug, setSelectedAnalyticsSlug] = useState<string>('all');
  const [showAnalyticsSelector, setShowAnalyticsSelector] = useState(false);

  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverviewData | null>(null);
  const [allProductsAnalytics, setAllProductsAnalytics] = useState<ProductAnalyticsItem[]>([]);
  const [viewsAnalytics, setViewsAnalytics] = useState<ViewsAnalytics | null>(null);
  const [clicksAnalytics, setClicksAnalytics] = useState<ClicksAnalytics | null>(null);
  const [conversionAnalytics, setConversionAnalytics] = useState<ConversionAnalytics | null>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<ConversionFunnelAnalytics | null>(null);
  const [channelRatioAnalytics, setChannelRatioAnalytics] = useState<ChannelRatioAnalytics | null>(null);
  const [growthPulseAnalytics, setGrowthPulseAnalytics] = useState<GrowthPulseAnalytics | null>(null);
  const [paymentModesAnalytics, setPaymentModesAnalytics] = useState<PaymentModesAnalytics | null>(null);
  const [demandHighlightsAnalytics, setDemandHighlightsAnalytics] = useState<DemandHighlightsAnalytics | null>(null);
  const [catalogueTelemetryAnalytics, setCatalogueTelemetryAnalytics] = useState<ProductAnalyticsItem[]>([]);
  const [inventorySummaryAnalytics, setInventorySummaryAnalytics] = useState<InventorySummaryAnalytics | null>(null);

  // TanStack Query for Analytics Overview data
  const {
    data: overviewData,
    isLoading: isLoadingQuery,
    isFetching: isFetchingQuery,
  } = useQuery<OverviewAggregatedResponse & AnalyticsOverviewData>({
    queryKey: QUERY_KEYS.analytics.overview(selectedAnalyticsSlug),
    queryFn: async () => {
      const inputPayload = selectedAnalyticsSlug && selectedAnalyticsSlug !== 'all' ? { slug: selectedAnalyticsSlug } : undefined;
      const res = await trpcRequest<OverviewAggregatedResponse & AnalyticsOverviewData>('analytics.getOverview', { input: inputPayload });
      return res;
    },
    enabled: Boolean(isAuthenticated) && (!activeTab || activeTab === 'dashboard' || activeTab === 'analytics'),
    staleTime: 60 * 1000,
  });

  // Sync query data into granular state pieces for consumer screens
  useEffect(() => {
    if (overviewData) {
      if (overviewData.viewsAnalytics) {
        setViewsAnalytics(overviewData.viewsAnalytics);
      }
      if (overviewData.clicksAnalytics) {
        setClicksAnalytics(overviewData.clicksAnalytics);
      }
      if (overviewData.conversionAnalytics) {
        setConversionAnalytics(overviewData.conversionAnalytics);
      }
      if (overviewData.funnelAnalytics) {
        setFunnelAnalytics(overviewData.funnelAnalytics);
      }
      if (overviewData.channelRatioAnalytics) {
        setChannelRatioAnalytics(overviewData.channelRatioAnalytics);
      }
      if (overviewData.growthPulseAnalytics) {
        setGrowthPulseAnalytics(overviewData.growthPulseAnalytics);
      }
      if (overviewData.paymentModesAnalytics) {
        setPaymentModesAnalytics(overviewData.paymentModesAnalytics);
      }
      if (overviewData.demandHighlightsAnalytics) {
        setDemandHighlightsAnalytics(overviewData.demandHighlightsAnalytics);
      }
      if (Array.isArray(overviewData.catalogueTelemetryAnalytics)) {
        setCatalogueTelemetryAnalytics(overviewData.catalogueTelemetryAnalytics);
        setAllProductsAnalytics(overviewData.catalogueTelemetryAnalytics);
      }
      if (overviewData.inventorySummaryAnalytics) {
        setInventorySummaryAnalytics(overviewData.inventorySummaryAnalytics);
      }

      if (overviewData.overview) {
        setAnalyticsOverview(overviewData.overview);
      } else {
        setAnalyticsOverview(overviewData);
      }
    }
  }, [overviewData]);

  const isLoadingAnalytics = isLoadingQuery || isFetchingQuery;

  const stats = useMemo(() => {
    if (inventorySummaryAnalytics) {
      return {
        total: inventorySummaryAnalytics.totalProducts ?? 0,
        listed: inventorySummaryAnalytics.inStockProducts ?? 0,
        oos: inventorySummaryAnalytics.outOfStockProducts ?? 0,
        active: inventorySummaryAnalytics.inStockProducts ?? 0,
      };
    }
    const total = products?.length ?? 0;
    const oos = products ? products.filter(p => !isProductInStock(p)).length : 0;
    const active = total - oos;
    const listed = products ? products.filter(p => p.isListed !== false).length : 0;

    return {
      total,
      listed,
      oos,
      active,
    };
  }, [inventorySummaryAnalytics, products]);

  const activeAnalyticsProduct = useMemo(() => {
    if (selectedAnalyticsSlug === 'all') return null;
    if (
      analyticsOverview?.product &&
      (analyticsOverview.product.slug === selectedAnalyticsSlug || analyticsOverview.product.id === selectedAnalyticsSlug)
    ) {
      return analyticsOverview.product;
    }
    const foundInTelemetry = catalogueTelemetryAnalytics.find(
      p => p.slug === selectedAnalyticsSlug || p.id === selectedAnalyticsSlug || p.productId === selectedAnalyticsSlug
    );
    if (foundInTelemetry) {
      return {
        id: foundInTelemetry.id || foundInTelemetry.productId,
        slug: foundInTelemetry.slug,
        name: foundInTelemetry.name,
        category: foundInTelemetry.category,
        price: foundInTelemetry.price,
        sellingPrice: foundInTelemetry.price,
        image: foundInTelemetry.image,
      };
    }
    return products?.find(p => p.slug === selectedAnalyticsSlug) || null;
  }, [selectedAnalyticsSlug, analyticsOverview, catalogueTelemetryAnalytics, products]);

  const handleFetchAnalytics = useCallback(async (slug?: string, force = false) => {
    if (!isAuthenticated) return;
    const targetSlug = slug !== undefined ? slug : selectedAnalyticsSlug;

    if (targetSlug !== selectedAnalyticsSlug) {
      setSelectedAnalyticsSlug(targetSlug);
    }

    if (force) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.overview(targetSlug) });
    }

    return queryClient.fetchQuery({
      queryKey: QUERY_KEYS.analytics.overview(targetSlug),
      queryFn: async () => {
        const inputPayload = targetSlug && targetSlug !== 'all' ? { slug: targetSlug } : undefined;
        return trpcRequest<OverviewAggregatedResponse & AnalyticsOverviewData>('analytics.getOverview', { input: inputPayload });
      },
    });
  }, [isAuthenticated, selectedAnalyticsSlug, trpcRequest]);

  const analyticsMetrics = useMemo(() => {
    const views = viewsAnalytics?.views ?? analyticsOverview?.views ?? 0;
    const waHits = clicksAnalytics?.whatsappClicks ?? analyticsOverview?.whatsappClicks ?? 0;
    const igHits = clicksAnalytics?.instagramClicks ?? analyticsOverview?.instagramClicks ?? 0;
    const conv = conversionAnalytics?.conversionRate ?? analyticsOverview?.conversionRate ?? 0;
    return {
      isUnavailable: false,
      views,
      waHits,
      igHits,
      wlHits: 0,
      conversion: conv,
      pipeline: waHits + igHits,
    };
  }, [viewsAnalytics, clicksAnalytics, conversionAnalytics, analyticsOverview]);

  const fetchPaginatedCatalogueTelemetry = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'views' | 'inquiries' | 'orders' | 'conversion' | 'revenue';
  }): Promise<PaginatedCatalogueTelemetryResult> => {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.analytics.catalogueTelemetry(params),
        queryFn: async () => {
          return trpcRequest<PaginatedCatalogueTelemetryResult>('analytics.getCatalogueTelemetryPaginated', {
            input: {
              page: params?.page ?? 1,
              limit: params?.limit ?? 10,
              search: params?.search ?? undefined,
              sortBy: params?.sortBy ?? 'views',
            },
          });
        },
      });
      return (
        res || {
          items: [],
          total: 0,
          page: 1,
          limit: params?.limit ?? 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          summary: {
            totalViews: 0,
            totalInquiries: 0,
            totalOrders: 0,
            totalRevenue: 0,
            overallConv: '0',
          },
        }
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('[fetchPaginatedCatalogueTelemetry Error]:', errorMsg);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: params?.limit ?? 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        summary: {
          totalViews: 0,
          totalInquiries: 0,
          totalOrders: 0,
          totalRevenue: 0,
          overallConv: '0',
        },
      };
    }
  };

  return {
    analyticsOverview,
    setAnalyticsOverview,
    allProductsAnalytics,
    viewsAnalytics,
    clicksAnalytics,
    conversionAnalytics,
    funnelAnalytics,
    channelRatioAnalytics,
    growthPulseAnalytics,
    paymentModesAnalytics,
    demandHighlightsAnalytics,
    catalogueTelemetryAnalytics,
    inventorySummaryAnalytics,
    isLoadingAnalytics,
    handleFetchAnalytics,
    fetchPaginatedCatalogueTelemetry,
    selectedAnalyticsSlug,
    setSelectedAnalyticsSlug,
    showAnalyticsSelector,
    setShowAnalyticsSelector,
    stats,
    activeAnalyticsProduct,
    analyticsMetrics,
  };
}

