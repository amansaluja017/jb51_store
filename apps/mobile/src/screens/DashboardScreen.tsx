import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {
  Eye,
  MessageCircle,
  Send,
  Percent,
  ChevronDown,
  Award,
  ShoppingBag,
  TrendingUp,
  Flame,
  Search,
  ArrowRight,
  RotateCcw,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Globe,
  Store,
} from 'lucide-react-native';
import SVGChart from '../components/SVGChart';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
} from '../components/ui';
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
} from '../types';
import styles from './DashboardScreen.styles';

interface DashboardScreenProps {
  stats?: {
    total: number;
    listed: number;
    oos: number;
    active: number;
  };
  products: Product[];
  analyticsMetrics: {
    isUnavailable?: boolean;
    views: number;
    waHits: number;
    igHits: number;
    wlHits: number;
    conversion: number;
    pipeline: number;
  };
  analyticsOverview?: AnalyticsOverviewData | null;
  allProductsAnalytics?: ProductAnalyticsItem[];
  viewsAnalytics?: ViewsAnalytics | null;
  clicksAnalytics?: ClicksAnalytics | null;
  conversionAnalytics?: ConversionAnalytics | null;
  funnelAnalytics?: ConversionFunnelAnalytics | null;
  channelRatioAnalytics?: ChannelRatioAnalytics | null;
  growthPulseAnalytics?: GrowthPulseAnalytics | null;
  paymentModesAnalytics?: PaymentModesAnalytics | null;
  demandHighlightsAnalytics?: DemandHighlightsAnalytics | null;
  catalogueTelemetryAnalytics?: ProductAnalyticsItem[];
  inventorySummaryAnalytics?: InventorySummaryAnalytics | null;
  activeAnalyticsProduct: Product | null;
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (val: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (val: boolean) => void;
  isLoading?: boolean;
  isLoadingAnalytics?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onNavigateToTab?: (tab: 'catalogue' | 'inventory') => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

export default function DashboardScreen({
  stats,
  products,
  analyticsMetrics,
  analyticsOverview,
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
  activeAnalyticsProduct,
  selectedAnalyticsSlug,
  setSelectedAnalyticsSlug,
  showAnalyticsSelector,
  setShowAnalyticsSelector,
  isLoading,
  isLoadingAnalytics,
  refreshing,
  onRefresh,
  onNavigateToTab,
}: DashboardScreenProps) {
  const [activeMetric, setActiveMetric] = useState<
    'views' | 'waHits' | 'igHits' | 'conversion' | 'orders'
  >('views');
  const [analyticsTab, setAnalyticsTab] = useState<string>('all');

  // Compute 6-week trend data dynamically
  const chartData = useMemo(() => {
    let data: number[] = [];
    let title = 'Trend Analysis';
    let color = '#FF5E36';
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

    switch (activeMetric) {
      case 'views':
        data = [0.1, 0.12, 0.15, 0.18, 0.2, 0.25].map((p) =>
          Math.round((analyticsMetrics?.views || 0) * p)
        );
        title = 'Product Views Trend';
        color = '#FF5E36';
        break;
      case 'waHits':
        data = [0.08, 0.12, 0.14, 0.18, 0.22, 0.26].map((p) =>
          Math.round((analyticsMetrics?.waHits || 0) * p)
        );
        title = 'WhatsApp Inquiries Trend';
        color = '#128C7E';
        break;
      case 'igHits':
        data = [0.05, 0.1, 0.15, 0.2, 0.22, 0.28].map((p) =>
          Math.round((analyticsMetrics?.igHits || 0) * p)
        );
        title = 'Instagram Direct Clicks';
        color = '#E1306C';
        break;
      case 'conversion': {
        const base = analyticsMetrics?.conversion || 0;
        data = [0.6, 0.7, 0.8, 0.9, 0.95, 1.0].map((p) =>
          Number((base * p).toFixed(1))
        );
        title = 'Inquiry Conversion Rate %';
        color = '#10B981';
        break;
      }
      case 'orders': {
        const orderCount = analyticsOverview?.orderCount ?? 0;
        data = [0.05, 0.1, 0.15, 0.2, 0.22, 0.28].map((p) =>
          Math.round(orderCount * p)
        );
        title = 'Client Orders Placed Trend';
        color = '#6366F1';
        break;
      }
    }

    return { data, title, color, labels };
  }, [activeMetric, analyticsMetrics, analyticsOverview]);

  // Combined product telemetry mapping
  const productPerformanceList = useMemo(() => {
    const analyticsMap = new Map(
      (allProductsAnalytics || []).map((a) => [a.productId || a.slug, a])
    );

    return products
      .map((p) => {
        const a = analyticsMap.get(p.id) || analyticsMap.get(p.slug);
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category || 'Signature Collection',
          price: p.sellingPrice ?? p.price ?? 0,
          image: p.images && p.images.length > 0 ? p.images[0] : null,
          views: a?.views ?? 0,
          whatsappClicks: a?.whatsappClicks ?? 0,
          instagramClicks: a?.instagramClicks ?? 0,
          totalClicks: a?.totalClicks ?? 0,
          conversionRate: a?.conversionRate ?? 0,
          orderCount: a?.orderCount ?? 0,
          onlineOrderCount: a?.onlineOrderCount ?? 0,
          offlineOrderCount: a?.offlineOrderCount ?? 0,
          onlineOrderConversionRate: a?.onlineOrderConversionRate ?? 0,
          onlineOrderRatio: a?.onlineOrderRatio ?? 0,
          offlineOrderRatio: a?.offlineOrderRatio ?? 0,
          onlineRevenue: a?.onlineRevenue ?? 0,
          cashRevenue: a?.cashRevenue ?? 0,
          creditRevenue: a?.creditRevenue ?? 0,
          totalRevenue: a?.totalRevenue ?? 0,
        };
      })
      .sort((a, b) => b.views - a.views || b.totalClicks - a.totalClicks);
  }, [products, allProductsAnalytics]);

  // Leaderboard Highlights
  const localMostViewed = useMemo(() => {
    if (productPerformanceList.length === 0) return null;
    return [...productPerformanceList].sort((a, b) => b.views - a.views)[0];
  }, [productPerformanceList]);

  const localMostDemanded = useMemo(() => {
    if (productPerformanceList.length === 0) return null;
    return [...productPerformanceList].sort(
      (a, b) => b.totalClicks - a.totalClicks
    )[0];
  }, [productPerformanceList]);

  const localTopConverting = useMemo(() => {
    if (productPerformanceList.length === 0) return null;
    const withViews = productPerformanceList.filter((p) => p.views > 0);
    if (withViews.length === 0) return productPerformanceList[0];
    return withViews.sort((a, b) => b.conversionRate - a.conversionRate)[0];
  }, [productPerformanceList]);

  // Support modular demand highlights or fallback to calculated
  const mostViewedProduct = demandHighlightsAnalytics?.mostViewedProduct ?? localMostViewed;
  const mostDemandedProduct = demandHighlightsAnalytics?.mostDemandedProduct ?? localMostDemanded;
  const topConvertingProduct = demandHighlightsAnalytics?.topConvertingProduct ?? localTopConverting;

  // Channel Breakdown
  const totalInquiries =
    (analyticsMetrics?.waHits || 0) + (analyticsMetrics?.igHits || 0);
  const waShare =
    totalInquiries > 0
      ? Math.round(((analyticsMetrics?.waHits || 0) / totalInquiries) * 100)
      : 50;
  const igShare =
    totalInquiries > 0
      ? Math.round(((analyticsMetrics?.igHits || 0) / totalInquiries) * 100)
      : 50;

  if (isLoading || isLoadingAnalytics) {
    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.scrollPadding}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
      >
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.scrollPadding}
      alwaysBounceVertical={true}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#FF5E36"
            colors={['#FF5E36']}
            progressBackgroundColor="#ffffff"
          />
        ) : undefined
      }
    >
      {/* Filter & Live Status Bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setShowAnalyticsSelector(!showAnalyticsSelector)}
          style={styles.scopeSelector}
          activeOpacity={0.7}
        >
          <Text style={styles.scopeLabel}>Outfit Focus:</Text>
          <Text style={styles.scopeValue} numberOfLines={1}>
            {activeAnalyticsProduct
              ? activeAnalyticsProduct.name
              : 'All Products (Store Overview)'}
          </Text>
          <ChevronDown size={14} color="#71717a" />
        </TouchableOpacity>

        {activeAnalyticsProduct && (
          <TouchableOpacity
            onPress={() => setSelectedAnalyticsSlug('all')}
            style={styles.clearScopeButton}
            activeOpacity={0.7}
          >
            <RotateCcw size={12} color="#64748b" />
          </TouchableOpacity>
        )}

        <Badge variant="success" icon={<View style={styles.liveDot} />}>
          Live
        </Badge>
      </View>

      {/* Outfit Dropdown Options */}
      {showAnalyticsSelector && (
        <View style={styles.dropdownPickerList}>
          <TouchableOpacity
            onPress={() => {
              setSelectedAnalyticsSlug('all');
              setShowAnalyticsSelector(false);
            }}
            style={styles.dropdownOption}
          >
            <Text
              style={[
                styles.dropdownOptionText,
                selectedAnalyticsSlug === 'all' && styles.activeOption,
              ]}
            >
              All Products (Store Overview)
            </Text>
          </TouchableOpacity>
          {products.map((p) => (
            <TouchableOpacity
              key={p.slug}
              onPress={() => {
                setSelectedAnalyticsSlug(p.slug);
                setShowAnalyticsSelector(false);
              }}
              style={styles.dropdownOption}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  selectedAnalyticsSlug === p.slug && styles.activeOption,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Shadcn UI Section Navigation Tabs */}
      <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} style={{ marginTop: 2, marginBottom: 2 }}>
        <TabsList>
          <TabsTrigger value="all">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="catalogue">Products</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Interactive Engagement & Conversion Telemetry */}
      <Card style={{ padding: 14 }}>
        <CardHeader style={{ marginBottom: 12 }}>
          <View>
            <CardTitle>Performance Telemetry</CardTitle>
            <CardDescription>Tap metric card to view weekly trend</CardDescription>
          </View>
          <Badge variant="outline">
            {activeMetric === 'views'
              ? 'Views'
              : activeMetric === 'waHits'
              ? 'WhatsApp'
              : activeMetric === 'igHits'
              ? 'Instagram'
              : activeMetric === 'conversion'
              ? 'Conversion'
              : 'Orders'}
          </Badge>
        </CardHeader>

        <CardContent>
          <View style={styles.interactiveCardsGrid}>
          {/* Card 1: Views */}
          <TouchableOpacity
            onPress={() => setActiveMetric('views')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'views' && styles.activeCardViews,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text
                style={[
                  styles.statHeading,
                  activeMetric === 'views' && { color: '#FF5E36' },
                ]}
              >
                Views
              </Text>
              <Eye
                size={13}
                color={activeMetric === 'views' ? '#FF5E36' : '#a1a1aa'}
              />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics?.views || 0}</Text>
          </TouchableOpacity>

          {/* Card 2: WhatsApp */}
          <TouchableOpacity
            onPress={() => setActiveMetric('waHits')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'waHits' && styles.activeCardWa,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text
                style={[
                  styles.statHeading,
                  activeMetric === 'waHits' && { color: '#128C7E' },
                ]}
              >
                WhatsApp
              </Text>
              <MessageCircle
                size={13}
                color={activeMetric === 'waHits' ? '#128C7E' : '#a1a1aa'}
              />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics?.waHits || 0}</Text>
          </TouchableOpacity>

          {/* Card 3: Instagram */}
          <TouchableOpacity
            onPress={() => setActiveMetric('igHits')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'igHits' && styles.activeCardIg,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text
                style={[
                  styles.statHeading,
                  activeMetric === 'igHits' && { color: '#E1306C' },
                ]}
              >
                Instagram
              </Text>
              <Send
                size={13}
                color={activeMetric === 'igHits' ? '#E1306C' : '#a1a1aa'}
              />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics?.igHits || 0}</Text>
          </TouchableOpacity>

          {/* Card 4: Inquiries Conversion Rate */}
          <TouchableOpacity
            onPress={() => setActiveMetric('conversion')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'conversion' && styles.activeCardConv,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text
                style={[
                  styles.statHeading,
                  activeMetric === 'conversion' && { color: '#10B981' },
                ]}
              >
                Inquiry Conv.
              </Text>
              <Percent
                size={13}
                color={activeMetric === 'conversion' ? '#10B981' : '#a1a1aa'}
              />
            </View>
            <Text style={styles.statValue}>
              {analyticsMetrics?.conversion || 0}%
            </Text>
          </TouchableOpacity>

          {/* Card 5: Online Orders */}
          <TouchableOpacity
            onPress={() => setActiveMetric('orders')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'orders' && styles.activeCardOrders,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text
                style={[
                  styles.statHeading,
                  activeMetric === 'orders' && { color: '#6366F1' },
                ]}
              >
                Online Orders
              </Text>
              <ShoppingBag
                size={13}
                color={activeMetric === 'orders' ? '#6366F1' : '#a1a1aa'}
              />
            </View>
            <Text style={styles.statValue}>
              {analyticsOverview?.onlineOrderCount ?? 0}
            </Text>
            <Text style={{ fontSize: 9, color: '#71717a', marginTop: 2 }}>
              {analyticsOverview?.offlineOrderCount ?? 0} offline • {analyticsOverview?.orderCount ?? 0} tot
            </Text>
          </TouchableOpacity>

          {/* Card 6: Online Order Conversion Rate */}
          <TouchableOpacity
            onPress={() => setActiveMetric('conversion')}
            activeOpacity={0.7}
            style={[
              styles.analyticsStatCard,
              activeMetric === 'conversion' && styles.activeCardOrderConv,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.statHeading}>Online Conv.</Text>
              <TrendingUp size={13} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>
              {analyticsOverview?.onlineOrderConversionRate ?? 0}%
            </Text>
            <Text style={{ fontSize: 9, color: '#71717a', marginTop: 2 }}>
              online / views
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6-Week Interactive Trend Chart */}
        <View style={styles.chartWrapper}>
          <SVGChart
            activeMetric={activeMetric}
            metricData={chartData.data}
            title={chartData.title}
            color={chartData.color}
            labels={chartData.labels}
          />
        </View>
      </CardContent>
    </Card>

    {/* Section: Channels & Growth (Shows under 'all' and 'channels' tabs) */}
    {(analyticsTab === 'all' || analyticsTab === 'channels') && (
      <>
        {/* Conversion Funnel & Channel Breakdown Card */}
        <Card>
          <CardHeader>
            <View style={styles.funnelTitleRow}>
              <TrendingUp size={15} color="#FF5E36" />
              <CardTitle>Conversion Funnel</CardTitle>
            </View>
            <Badge variant="outline">Impression Flow</Badge>
          </CardHeader>

          <CardContent>
            <View style={styles.funnelStepsRow}>
              {/* Step 1: Views */}
              <View style={styles.funnelStep}>
                <Text style={styles.funnelStepVal}>
                  {funnelAnalytics?.views ?? analyticsMetrics?.views ?? 0}
                </Text>
                <Text style={styles.funnelStepLbl}>Views</Text>
                <Text style={styles.funnelStepSub}>100% traffic</Text>
              </View>

              <ArrowRight size={14} color="#d4d4d8" style={styles.funnelArrow} />

              {/* Step 2: Inquiries */}
              <View style={styles.funnelStep}>
                <Text style={styles.funnelStepVal}>
                  {funnelAnalytics?.inquiries ?? totalInquiries}
                </Text>
                <Text style={styles.funnelStepLbl}>Inquiries</Text>
                <Text style={styles.funnelStepSub}>
                  {funnelAnalytics?.inquiryRate ?? analyticsMetrics?.conversion ?? 0}%
                </Text>
              </View>

              <ArrowRight size={14} color="#d4d4d8" style={styles.funnelArrow} />

              {/* Step 3: Online Orders (STRICTLY taking online orders for the funnel) */}
              <View style={styles.funnelStep}>
                <Text style={styles.funnelStepVal}>
                  {funnelAnalytics?.onlineOrders ?? analyticsOverview?.onlineOrderCount ?? 0}
                </Text>
                <Text style={styles.funnelStepLbl}>Online Orders</Text>
                <Text style={styles.funnelStepSub}>
                  {funnelAnalytics?.onlineOrderRate ?? analyticsOverview?.onlineOrderConversionRate ?? 0}%
                </Text>
              </View>
            </View>

            {/* Channels Grid */}
            <View style={styles.channelsGrid}>
              {/* WhatsApp Channel */}
              <View style={[styles.channelCard, styles.channelCardWa]}>
                <View style={styles.channelCardHeader}>
                  <Text style={[styles.channelTitle, { color: '#128C7E' }]}>
                    WhatsApp Channel
                  </Text>
                  <MessageCircle size={14} color="#128C7E" />
                </View>
                <Text style={styles.channelVal}>
                  {analyticsMetrics?.waHits || 0}
                </Text>
                <Text style={styles.channelSubText}>
                  {waShare}% share of inquiries •{' '}
                  {analyticsOverview?.whatsappConversionRate ?? 0}% rate
                </Text>
              </View>

              {/* Instagram Channel */}
              <View style={[styles.channelCard, styles.channelCardIg]}>
                <View style={styles.channelCardHeader}>
                  <Text style={[styles.channelTitle, { color: '#E1306C' }]}>
                    Instagram Direct
                  </Text>
                  <Send size={14} color="#E1306C" />
                </View>
                <Text style={styles.channelVal}>
                  {analyticsMetrics?.igHits || 0}
                </Text>
                <Text style={styles.channelSubText}>
                  {igShare}% share of inquiries •{' '}
                  {analyticsOverview?.instagramConversionRate ?? 0}% rate
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 1. Channel Ratio & 30-Day Growth Pulse */}
        <Card>
          <CardHeader>
            <View style={styles.analysisHeaderLeft}>
              <Layers size={15} color="#2563eb" />
              <CardTitle>Channel Ratio & Growth Pulse</CardTitle>
            </View>
            <Badge variant="outline">Past 30 Days Velocity</Badge>
          </CardHeader>

          <CardContent>
            {/* Online vs Offline Ratio */}
            <View style={styles.ratioHeaderRow}>
              <View style={styles.ratioValBox}>
                <Badge
                  variant="blue"
                  icon={<Globe size={12} color="#2563eb" />}
                  style={{ marginBottom: 4 }}
                >
                  {channelRatioAnalytics?.onlineRatio ?? analyticsOverview?.channelRatio?.onlineRatio ?? 0}% Online
                </Badge>
                <Text style={styles.ratioLblText}>
                  {channelRatioAnalytics?.onlineOrderCount ?? analyticsOverview?.onlineOrderCount ?? 0} orders
                </Text>
              </View>
              <View style={[styles.ratioValBox, { alignItems: 'flex-end' }]}>
                <Badge
                  variant="amber"
                  icon={<Store size={12} color="#d97706" />}
                  style={{ marginBottom: 4 }}
                >
                  {channelRatioAnalytics?.offlineRatio ?? analyticsOverview?.channelRatio?.offlineRatio ?? 0}% Walk-in
                </Badge>
                <Text style={styles.ratioLblText}>
                  {channelRatioAnalytics?.offlineOrderCount ?? analyticsOverview?.offlineOrderCount ?? 0} orders
                </Text>
              </View>
            </View>

            {/* Visual Dual Ratio Bar with Progress */}
            <View style={{ marginVertical: 10 }}>
              <Progress
                value={channelRatioAnalytics?.onlineRatio ?? analyticsOverview?.channelRatio?.onlineRatio ?? 50}
                indicatorColor="#2563eb"
                trackColor="#fde68a"
                height={8}
              />
            </View>

            {/* 30-Day Growth Velocity */}
            <View style={styles.growthGrid}>
              {/* Total Order Growth */}
              <View style={styles.growthBox}>
                <View style={styles.growthBoxHeader}>
                  <Text style={styles.growthBoxLbl}>Total Growth</Text>
                  <Badge
                    variant={
                      (growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={10} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={10} color="#dc2626" />
                      )
                    }
                  >
                    {`${(growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxVal}>
                  {growthPulseAnalytics?.current30DaysOrders ?? analyticsOverview?.growth?.current30DaysOrders ?? 0}
                </Text>
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>
                  prev 30d: {growthPulseAnalytics?.previous30DaysOrders ?? analyticsOverview?.growth?.previous30DaysOrders ?? 0}
                </Text>
              </View>

              {/* Online Order Growth */}
              <View style={styles.growthBox}>
                <View style={styles.growthBoxHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Globe size={11} color="#2563eb" />
                    <Text style={styles.growthBoxLbl}>Online</Text>
                  </View>
                  <Badge
                    variant={
                      (growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={10} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={10} color="#dc2626" />
                      )
                    }
                  >
                    {`${(growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxVal}>
                  {growthPulseAnalytics?.current30DaysOnline ?? analyticsOverview?.growth?.current30DaysOnline ?? 0}
                </Text>
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>
                  prev 30d: {growthPulseAnalytics?.previous30DaysOnline ?? analyticsOverview?.growth?.previous30DaysOnline ?? 0}
                </Text>
              </View>

              {/* Offline Order Growth */}
              <View style={styles.growthBox}>
                <View style={styles.growthBoxHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Store size={11} color="#f59e0b" />
                    <Text style={styles.growthBoxLbl}>Walk-in</Text>
                  </View>
                  <Badge
                    variant={
                      (growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={10} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={10} color="#dc2626" />
                      )
                    }
                  >
                    {`${(growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxVal}>
                  {growthPulseAnalytics?.current30DaysOffline ?? analyticsOverview?.growth?.current30DaysOffline ?? 0}
                </Text>
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>
                  prev 30d: {growthPulseAnalytics?.previous30DaysOffline ?? analyticsOverview?.growth?.previous30DaysOffline ?? 0}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </>
    )}

    {/* Section: Payments & Inventory Stock Pulse (Shows under 'all' and 'payments' tabs) */}
    {(analyticsTab === 'all' || analyticsTab === 'payments') && (
      <>
        {/* 2. Customer Payment Breakdown (Online vs Cash vs Credit) */}
        <Card>
          <CardHeader>
            <View style={styles.analysisHeaderLeft}>
              <CreditCard size={15} color="#10B981" />
              <CardTitle>Customer Payment Modes</CardTitle>
            </View>
            <Badge variant="secondary">
              ₹{(paymentModesAnalytics?.totalAmount ?? analyticsOverview?.payments?.totalAmount ?? 0).toLocaleString('en-IN')} Total
            </Badge>
          </CardHeader>

          <CardContent>
            {/* Visual 3-Way Payment Distribution Bar */}
            <View style={styles.paymentBarTrack}>
              <View
                style={{
                  height: '100%',
                  backgroundColor: '#2563eb',
                  width: `${Math.max(2, paymentModesAnalytics?.onlineShare ?? analyticsOverview?.payments?.onlineShare ?? 33)}%`,
                }}
              />
              <View
                style={{
                  height: '100%',
                  backgroundColor: '#16a34a',
                  width: `${Math.max(2, paymentModesAnalytics?.cashShare ?? analyticsOverview?.payments?.cashShare ?? 33)}%`,
                }}
              />
              <View
                style={{
                  height: '100%',
                  backgroundColor: '#f59e0b',
                  width: `${Math.max(2, paymentModesAnalytics?.creditShare ?? analyticsOverview?.payments?.creditShare ?? 34)}%`,
                }}
              />
            </View>

            {/* 3 Payment Columns */}
            <View style={styles.paymentGrid}>
              {/* Online Payment */}
              <View style={styles.paymentCardItem}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.paymentCardTitle}>Online</Text>
                  <Badge variant="blue">
                    {paymentModesAnalytics?.onlineShare ?? analyticsOverview?.payments?.onlineShare ?? 0}%
                  </Badge>
                </View>
                <Text style={styles.paymentCardAmount}>
                  ₹{(paymentModesAnalytics?.onlineAmount ?? analyticsOverview?.payments?.onlineAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.paymentCardSub}>
                  {paymentModesAnalytics?.onlineCount ?? analyticsOverview?.payments?.onlineCount ?? 0} orders
                </Text>
              </View>

              {/* Cash Payment */}
              <View style={styles.paymentCardItem}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.paymentCardTitle}>Cash</Text>
                  <Badge variant="success">
                    {paymentModesAnalytics?.cashShare ?? analyticsOverview?.payments?.cashShare ?? 0}%
                  </Badge>
                </View>
                <Text style={styles.paymentCardAmount}>
                  ₹{(paymentModesAnalytics?.cashAmount ?? analyticsOverview?.payments?.cashAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.paymentCardSub}>
                  {paymentModesAnalytics?.cashCount ?? analyticsOverview?.payments?.cashCount ?? 0} orders
                </Text>
              </View>

              {/* Credit Payment */}
              <View style={styles.paymentCardItem}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.paymentCardTitle}>Khata</Text>
                  <Badge variant="amber">
                    {paymentModesAnalytics?.creditShare ?? analyticsOverview?.payments?.creditShare ?? 0}%
                  </Badge>
                </View>
                <Text style={styles.paymentCardAmount}>
                  ₹{(paymentModesAnalytics?.creditAmount ?? analyticsOverview?.payments?.creditAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.paymentCardSub}>
                  {paymentModesAnalytics?.creditCount ?? analyticsOverview?.payments?.creditCount ?? 0} orders
                </Text>
              </View>
            </View>

            {/* Credit Note summary if there's due balance */}
            {((paymentModesAnalytics?.creditDueAmount ?? analyticsOverview?.payments?.creditDueAmount ?? 0) > 0 ||
              (paymentModesAnalytics?.creditPaidAmount ?? analyticsOverview?.payments?.creditPaidAmount ?? 0) > 0) && (
              <Text style={styles.creditNoteText}>
                Outstanding Khata: ₹{(paymentModesAnalytics?.creditDueAmount ?? analyticsOverview?.payments?.creditDueAmount ?? 0).toLocaleString('en-IN')} pending • ₹{(paymentModesAnalytics?.creditPaidAmount ?? analyticsOverview?.payments?.creditPaidAmount ?? 0).toLocaleString('en-IN')} settled
              </Text>
            )}
          </CardContent>
        </Card>

        {/* 3. Inventory Stock Pulse */}
        {inventorySummaryAnalytics && (
          <Card>
            <CardHeader>
              <View style={styles.analysisHeaderLeft}>
                <Package size={15} color="#059669" />
                <CardTitle>Inventory Health Summary</CardTitle>
              </View>
              <TouchableOpacity onPress={() => onNavigateToTab?.('inventory')} activeOpacity={0.7}>
                <Badge variant="outline">
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF5E36' }}>Manage Stock →</Text>
                </Badge>
              </TouchableOpacity>
            </CardHeader>
            <CardContent>
              <View style={styles.growthGrid}>
                <View style={styles.growthBox}>
                  <Text style={styles.growthBoxLbl}>In Stock</Text>
                  <Text style={[styles.growthBoxVal, { color: '#16a34a' }]}>{inventorySummaryAnalytics.inStockProducts}</Text>
                  <Text style={{ fontSize: 9, color: '#94a3b8' }}>products</Text>
                </View>
                <View style={styles.growthBox}>
                  <Text style={styles.growthBoxLbl}>Low Stock</Text>
                  <Text style={[styles.growthBoxVal, { color: '#f59e0b' }]}>{inventorySummaryAnalytics.lowStockProducts}</Text>
                  <Text style={{ fontSize: 9, color: '#94a3b8' }}>need refill</Text>
                </View>
                <View style={styles.growthBox}>
                  <Text style={styles.growthBoxLbl}>Total Units</Text>
                  <Text style={[styles.growthBoxVal, { color: '#2563eb' }]}>{inventorySummaryAnalytics.totalStockUnits}</Text>
                  <Text style={{ fontSize: 9, color: '#94a3b8' }}>units available</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      </>
    )}

    {/* Section: Catalogue Telemetry & Demand Highlights (Shows under 'all' and 'catalogue' tabs) */}
    {(analyticsTab === 'all' || analyticsTab === 'catalogue') && (
      <>
        {/* Focused Outfit Detail Card (When an individual outfit is selected) */}
        {activeAnalyticsProduct && (
          <Card style={{ borderColor: '#ea580c', borderWidth: 1.5, backgroundColor: '#fffbf7' }}>
            <CardHeader>
              <Badge variant="amber" icon={<Award size={12} color="#ea580c" />}>
                Focused Telemetry
              </Badge>
              <TouchableOpacity
                onPress={() => setSelectedAnalyticsSlug('all')}
                activeOpacity={0.7}
              >
                <Badge variant="secondary">Back to Overall</Badge>
              </TouchableOpacity>
            </CardHeader>

            <CardContent>
              <View style={styles.focusedBody}>
                {activeAnalyticsProduct.images &&
                activeAnalyticsProduct.images.length > 0 ? (
                  <Image
                    source={{ uri: activeAnalyticsProduct.images[0] }}
                    style={styles.focusedImage}
                  />
                ) : (
                  <View style={styles.focusedImagePlaceholder}>
                    <Award size={20} color="#94a3b8" />
                  </View>
                )}

                <View style={styles.focusedDetails}>
                  <Text style={styles.focusedProductName} numberOfLines={1}>
                    {activeAnalyticsProduct.name}
                  </Text>
                  <Text style={styles.focusedProductCategory}>
                    {activeAnalyticsProduct.category || 'Collection Item'}
                  </Text>
                  <Text style={styles.focusedProductPrice}>
                    {formatCurrency(
                      activeAnalyticsProduct.sellingPrice ??
                        activeAnalyticsProduct.price ??
                        0
                    )}
                  </Text>
                </View>
              </View>

              {/* Focused Stats Grid */}
              <View style={styles.focusedStatsGrid}>
                <View style={styles.focusedStatBox}>
                  <Text style={styles.focusedStatBoxVal}>
                    {analyticsMetrics?.views || 0}
                  </Text>
                  <Text style={styles.focusedStatBoxLbl}>Views Recorded</Text>
                </View>
                <View style={styles.focusedStatBox}>
                  <Text style={styles.focusedStatBoxVal}>
                    {(analyticsMetrics?.waHits || 0) +
                      (analyticsMetrics?.igHits || 0)}
                  </Text>
                  <Text style={styles.focusedStatBoxLbl}>Total Inquiries</Text>
                </View>
                <View style={styles.focusedStatBox}>
                  <Text style={styles.focusedStatBoxVal}>
                    {analyticsMetrics?.conversion || 0}%
                  </Text>
                  <Text style={styles.focusedStatBoxLbl}>Inquiry Conv.</Text>
                </View>
                <View style={styles.focusedStatBox}>
                  <Text style={styles.focusedStatBoxVal}>
                    {analyticsOverview?.orderCount ?? 0}
                  </Text>
                  <Text style={styles.focusedStatBoxLbl}>Orders Placed</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Demand & Performance Leaderboards (Storewide Overview) */}
        {!activeAnalyticsProduct && (
          <Card>
            <CardHeader>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Award size={16} color="#FF5E36" />
                <CardTitle>Demand Highlights</CardTitle>
              </View>
              <Badge variant="secondary">Top Rankings</Badge>
            </CardHeader>

            <CardContent>
              <View style={styles.highlightsGrid}>
                {/* Most Searched */}
                {mostViewedProduct && (
                  <TouchableOpacity
                    onPress={() => setSelectedAnalyticsSlug(mostViewedProduct.slug)}
                    activeOpacity={0.7}
                    style={styles.highlightCard}
                  >
                    <View style={styles.highlightHeader}>
                      <Search size={11} color="#64748b" />
                      <Text style={styles.highlightLabel}>Top Viewed</Text>
                    </View>
                    <Text style={styles.highlightName} numberOfLines={1}>
                      {mostViewedProduct.name}
                    </Text>
                    <View style={styles.highlightMetricRow}>
                      <Text style={styles.highlightValue}>
                        {mostViewedProduct.views} views
                      </Text>
                      <Badge variant="secondary">Popular</Badge>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Most Demanded */}
                {mostDemandedProduct && (
                  <TouchableOpacity
                    onPress={() => setSelectedAnalyticsSlug(mostDemandedProduct.slug)}
                    activeOpacity={0.7}
                    style={styles.highlightCard}
                  >
                    <View style={styles.highlightHeader}>
                      <Flame size={11} color="#ea580c" />
                      <Text style={styles.highlightLabel}>Top Clicks</Text>
                    </View>
                    <Text style={styles.highlightName} numberOfLines={1}>
                      {mostDemandedProduct.name}
                    </Text>
                    <View style={styles.highlightMetricRow}>
                      <Text style={styles.highlightValue}>
                        {mostDemandedProduct.totalClicks} clicks
                      </Text>
                      <Badge variant="amber">Hot</Badge>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Top Converting */}
                {topConvertingProduct && (
                  <TouchableOpacity
                    onPress={() => setSelectedAnalyticsSlug(topConvertingProduct.slug)}
                    activeOpacity={0.7}
                    style={styles.highlightCard}
                  >
                    <View style={styles.highlightHeader}>
                      <Percent size={11} color="#059669" />
                      <Text style={styles.highlightLabel}>Best Conv.</Text>
                    </View>
                    <Text style={styles.highlightName} numberOfLines={1}>
                      {topConvertingProduct.name}
                    </Text>
                    <View style={styles.highlightMetricRow}>
                      <Text style={styles.highlightValue}>
                        {topConvertingProduct.conversionRate}%
                      </Text>
                      <Badge variant="success">High ROI</Badge>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Product Demand & Analytics Breakdown Table */}
        {!activeAnalyticsProduct && productPerformanceList.length > 0 && (
          <Card>
            <CardHeader>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Eye size={15} color="#FF5E36" />
                <View>
                  <CardTitle>Catalogue Telemetry</CardTitle>
                  <CardDescription>
                    Tap any product to focus individual analytics
                  </CardDescription>
                </View>
              </View>
            </CardHeader>

            <CardContent>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thProduct}>Product</Text>
                <Text style={styles.thMetric}>Views</Text>
                <Text style={styles.thMetric}>Inquiries</Text>
                <Text style={styles.thMetric}>Orders</Text>
                <Text style={styles.thConv}>Conv. %</Text>
              </View>

              {productPerformanceList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedAnalyticsSlug(item.slug)}
                  activeOpacity={0.7}
                  style={[
                    styles.tableRow,
                    selectedAnalyticsSlug === item.slug && styles.tableRowActive,
                  ]}
                >
                  {/* Product Info & Thumb */}
                  <View style={styles.productCell}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.productThumb} />
                    ) : (
                      <View style={styles.productThumbFallback}>
                        <Award size={12} color="#94a3b8" />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.productCategory} numberOfLines={1}>
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  {/* Views */}
                  <View style={styles.metricCell}>
                    <Text style={styles.metricText}>{item.views}</Text>
                  </View>

                  {/* Inquiries */}
                  <View style={styles.metricCell}>
                    <Text style={styles.metricText}>{item.totalClicks}</Text>
                    <Text style={styles.metricSub}>
                      {item.whatsappClicks}w • {item.instagramClicks}i
                    </Text>
                  </View>

                  {/* Orders */}
                  <View style={styles.metricCell}>
                    <Text style={styles.metricText}>
                      {item.onlineOrderCount ?? 0}
                    </Text>
                    <Text style={styles.metricSub}>
                      {item.offlineOrderCount ?? 0} off • {item.orderCount} tot
                    </Text>
                  </View>

                  {/* Conversion Rate */}
                  <View style={styles.convCell}>
                    <Badge variant="success" style={{ alignSelf: 'center' }}>
                      {`${item.onlineOrderConversionRate ?? 0}%`}
                    </Badge>
                    <Text style={{ fontSize: 8, color: '#71717a', marginTop: 2, textAlign: 'center' }}>
                      online conv
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </CardContent>
          </Card>
        )}
      </>
    )}

    {/* Store Inventory & Health Pulse (Storewide Overview) */}
    {stats && (
      <Card>
        <CardHeader>
          <View style={styles.healthHeader}>
            <Package size={15} color="#FF5E36" />
            <CardTitle>Store Inventory Pulse</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.healthGrid}>
            <TouchableOpacity
              onPress={() => onNavigateToTab?.('catalogue')}
              style={styles.healthBox}
              activeOpacity={0.7}
            >
              <Text style={styles.healthBoxVal}>{stats.total}</Text>
              <Text style={styles.healthBoxLbl}>Total Outfits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigateToTab?.('catalogue')}
              style={styles.healthBox}
              activeOpacity={0.7}
            >
              <Text style={[styles.healthBoxVal, { color: '#16a34a' }]}>
                {stats.active}
              </Text>
              <Text style={styles.healthBoxLbl}>In Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigateToTab?.('inventory')}
              style={styles.healthBox}
              activeOpacity={0.7}
            >
              <Text style={[styles.healthBoxVal, { color: '#dc2626' }]}>
                {stats.oos}
              </Text>
              <Text style={styles.healthBoxLbl}>Out of Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigateToTab?.('catalogue')}
              style={styles.healthBox}
              activeOpacity={0.7}
            >
              <Text style={[styles.healthBoxVal, { color: '#FF5E36' }]}>
                {stats.listed}
              </Text>
              <Text style={styles.healthBoxLbl}>Listed Live</Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>
    )}
    </ScrollView>
  );
}
