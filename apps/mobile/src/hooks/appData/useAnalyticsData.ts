import { useState, useMemo, useEffect } from 'react';
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
  products: Product[];
  isAuthenticated: boolean;
  activeTab: string;
}

export function useAnalyticsData({
  trpcRequest,
  products,
  isAuthenticated,
  activeTab,
}: UseAnalyticsDataProps) {
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
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [selectedAnalyticsSlug, setSelectedAnalyticsSlug] = useState<string>('all');
  const [showAnalyticsSelector, setShowAnalyticsSelector] = useState(false);

  const stats = useMemo(() => {
    const total = products.length;
    const oos = products.filter(p => !isProductInStock(p)).length;
    const active = total - oos;
    const listed = products.filter(p => p.isListed !== false).length;

    return {
      total,
      listed,
      oos,
      active,
    };
  }, [products]);

  const activeAnalyticsProduct = useMemo(() => {
    if (selectedAnalyticsSlug === 'all') return null;
    return products.find(p => p.slug === selectedAnalyticsSlug) || null;
  }, [products, selectedAnalyticsSlug]);

  const handleFetchAnalytics = async (slug?: string) => {
    try {
      setIsLoadingAnalytics(true);
      const targetSlug = slug !== undefined ? slug : selectedAnalyticsSlug;
      const inputPayload = targetSlug && targetSlug !== 'all' ? { slug: targetSlug } : undefined;

      // Consolidated single backend request: backend executes with p-limit (concurrency: 3) & Promise.allSettled
      const res = await trpcRequest<OverviewAggregatedResponse & AnalyticsOverviewData>('analytics.getOverview', { input: inputPayload });

      if (res) {
        if (res.viewsAnalytics) {
          setViewsAnalytics(res.viewsAnalytics);
        }
        if (res.clicksAnalytics) {
          setClicksAnalytics(res.clicksAnalytics);
        }
        if (res.conversionAnalytics) {
          setConversionAnalytics(res.conversionAnalytics);
        }
        if (res.funnelAnalytics) {
          setFunnelAnalytics(res.funnelAnalytics);
        }
        if (res.channelRatioAnalytics) {
          setChannelRatioAnalytics(res.channelRatioAnalytics);
        }
        if (res.growthPulseAnalytics) {
          setGrowthPulseAnalytics(res.growthPulseAnalytics);
        }
        if (res.paymentModesAnalytics) {
          setPaymentModesAnalytics(res.paymentModesAnalytics);
        }
        if (res.demandHighlightsAnalytics) {
          setDemandHighlightsAnalytics(res.demandHighlightsAnalytics);
        }
        if (Array.isArray(res.catalogueTelemetryAnalytics)) {
          setCatalogueTelemetryAnalytics(res.catalogueTelemetryAnalytics);
          setAllProductsAnalytics(res.catalogueTelemetryAnalytics);
        }
        if (res.inventorySummaryAnalytics) {
          setInventorySummaryAnalytics(res.inventorySummaryAnalytics);
        }

        if (res.overview) {
          setAnalyticsOverview(res.overview);
        } else {
          setAnalyticsOverview(res);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('[handleFetchAnalytics Error]:', errorMsg);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'dashboard' || activeTab === 'analytics') {
      handleFetchAnalytics(selectedAnalyticsSlug);
    }
  }, [selectedAnalyticsSlug, isAuthenticated, activeTab]);

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
      const res = await trpcRequest<PaginatedCatalogueTelemetryResult>('analytics.getCatalogueTelemetryPaginated', {
        input: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search ?? undefined,
          sortBy: params?.sortBy ?? 'views',
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

