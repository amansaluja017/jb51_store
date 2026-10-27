import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
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
  Sparkles,
  FileText,
  FileSpreadsheet,
  Maximize2,
  X,
  SlidersHorizontal,
  Download,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
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
  showAlert?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

function escapeHtml(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  showAlert,
}: DashboardScreenProps) {
  const [activeMetric, setActiveMetric] = useState<
    'views' | 'waHits' | 'igHits' | 'conversion' | 'orders'
  >('views');
  const [analyticsTab, setAnalyticsTab] = useState<string>('all');
  const [showFullAnalysisModal, setShowFullAnalysisModal] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [modalSortKey, setModalSortKey] = useState<
    'views' | 'inquiries' | 'orders' | 'conversion' | 'revenue'
  >('views');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

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

  // Filtered and sorted products for Full View Telemetry Modal
  const filteredModalProducts = useMemo(() => {
    let list = [...productPerformanceList];
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    switch (modalSortKey) {
      case 'views':
        list.sort((a, b) => b.views - a.views);
        break;
      case 'inquiries':
        list.sort((a, b) => b.totalClicks - a.totalClicks);
        break;
      case 'orders':
        list.sort(
          (a, b) =>
            b.orderCount - a.orderCount ||
            (b.onlineOrderCount ?? 0) - (a.onlineOrderCount ?? 0)
        );
        break;
      case 'conversion':
        list.sort(
          (a, b) =>
            (b.onlineOrderConversionRate ?? 0) -
              (a.onlineOrderConversionRate ?? 0) ||
            b.conversionRate - a.conversionRate
        );
        break;
      case 'revenue':
        list.sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));
        break;
    }
    return list;
  }, [productPerformanceList, modalSearchQuery, modalSortKey]);

  // Aggregate telemetry totals for the modal summary ribbon
  const modalSummaryStats = useMemo(() => {
    const totalViews = productPerformanceList.reduce(
      (acc, p) => acc + (p.views || 0),
      0
    );
    const totalInquiries = productPerformanceList.reduce(
      (acc, p) => acc + (p.totalClicks || 0),
      0
    );
    const totalOrders = productPerformanceList.reduce(
      (acc, p) => acc + (p.orderCount || 0),
      0
    );
    const totalRevenue = productPerformanceList.reduce(
      (acc, p) => acc + (p.totalRevenue || 0),
      0
    );
    const overallConv =
      totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : '0';

    return {
      totalViews,
      totalInquiries,
      totalOrders,
      totalRevenue,
      overallConv,
    };
  }, [productPerformanceList]);

  // Export all products analysis via PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const rowsHtml = productPerformanceList
        .map(
          (p, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 9px 10px; font-weight: bold; color: #64748b; text-align: center;">#${idx + 1}</td>
          <td style="padding: 9px 10px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${escapeHtml(p.name)}</div>
            <div style="font-size: 10.5px; color: #64748b;">${escapeHtml(p.category)}</div>
          </td>
          <td style="padding: 9px 10px; font-weight: 600; text-align: right;">₹${(p.price || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 9px 10px; text-align: center; font-weight: 700;">${p.views}</td>
          <td style="padding: 9px 10px; text-align: center;">
            <span style="font-weight: 700;">${p.totalClicks}</span>
            <div style="font-size: 10px; color: #64748b;">${p.whatsappClicks} WA • ${p.instagramClicks} IG</div>
          </td>
          <td style="padding: 9px 10px; text-align: center;">
            <span style="font-weight: 700; color: #2563eb;">${p.onlineOrderCount ?? 0}</span>
            <div style="font-size: 10px; color: #64748b;">${p.offlineOrderCount ?? 0} off • ${p.orderCount} tot</div>
          </td>
          <td style="padding: 9px 10px; text-align: center;">
            <span style="background-color: #ecfdf5; color: #059669; font-weight: 700; padding: 2px 7px; border-radius: 5px; font-size: 11px;">
              ${p.onlineOrderConversionRate ?? 0}%
            </span>
          </td>
          <td style="padding: 9px 10px; text-align: right; font-weight: 800; color: #16a34a;">
            ₹${(p.totalRevenue ?? 0).toLocaleString('en-IN')}
          </td>
        </tr>
      `
        )
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>JB51 Store - All Products Analysis</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; }
            .header { border-bottom: 2px solid #FF5E36; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 20px; font-weight: 800; color: #09090b; letter-spacing: -0.3px; }
            .subtitle { font-size: 11.5px; color: #64748b; margin-top: 3px; }
            .date { font-size: 11px; color: #64748b; text-align: right; }
            .summary-box { display: flex; gap: 10px; margin-bottom: 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; }
            .summary-item { flex: 1; text-align: center; }
            .summary-val { font-size: 15px; font-weight: 800; color: #ea580c; }
            .summary-lbl { font-size: 9.5px; font-weight: 700; color: #9a3412; text-transform: uppercase; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
            th { background-color: #0f172a; color: #ffffff; padding: 9px 8px; text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">JB51 STORE • PRODUCTS ANALYSIS & TELEMETRY</div>
              <div class="subtitle">Complete Performance Audit • ${productPerformanceList.length} Active Catalogue Products</div>
            </div>
            <div class="date">
              Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-val">${productPerformanceList.length}</div>
              <div class="summary-lbl">Outfits</div>
            </div>
            <div class="summary-item">
              <div class="summary-val">${modalSummaryStats.totalViews}</div>
              <div class="summary-lbl">Total Views</div>
            </div>
            <div class="summary-item">
              <div class="summary-val">${modalSummaryStats.totalInquiries}</div>
              <div class="summary-lbl">Inquiries</div>
            </div>
            <div class="summary-item">
              <div class="summary-val">${modalSummaryStats.totalOrders}</div>
              <div class="summary-lbl">Total Orders</div>
            </div>
            <div class="summary-item">
              <div class="summary-val">${modalSummaryStats.overallConv}%</div>
              <div class="summary-lbl">Storewide Conv</div>
            </div>
            <div class="summary-item">
              <div class="summary-val">₹${modalSummaryStats.totalRevenue.toLocaleString('en-IN')}</div>
              <div class="summary-lbl">Revenue</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Product</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: center;">Views</th>
                <th style="text-align: center;">Inquiries</th>
                <th style="text-align: center;">Orders</th>
                <th style="text-align: center;">Conv. %</th>
                <th style="text-align: right;">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Confidential & Proprietary • JB51 Store Management Analytics Telemetry Engine
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Share Products Analysis PDF',
          });
        }
      }
      showAlert?.('Report Ready', 'All products analysis PDF generated successfully', 'success');
    } catch (err: any) {
      console.error('Export PDF error:', err);
      showAlert?.('Export Failed', err.message || 'Unable to generate PDF report', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export all products analysis via CSV / Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const headers = [
        'Rank',
        'Product Name',
        'Category',
        'Price (INR)',
        'Views',
        'WhatsApp Inquiries',
        'Instagram Inquiries',
        'Total Inquiries',
        'Inquiry Conv Rate (%)',
        'Online Orders',
        'Offline Orders',
        'Total Orders',
        'Online Conv Rate (%)',
        'Online Revenue (INR)',
        'Cash Revenue (INR)',
        'Credit Revenue (INR)',
        'Total Revenue (INR)',
      ];

      const csvRows = productPerformanceList.map((p, idx) =>
        [
          idx + 1,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          p.price || 0,
          p.views || 0,
          p.whatsappClicks || 0,
          p.instagramClicks || 0,
          p.totalClicks || 0,
          `${p.conversionRate || 0}%`,
          p.onlineOrderCount || 0,
          p.offlineOrderCount || 0,
          p.orderCount || 0,
          `${p.onlineOrderConversionRate || 0}%`,
          p.onlineRevenue || 0,
          p.cashRevenue || 0,
          p.creditRevenue || 0,
          p.totalRevenue || 0,
        ].join(',')
      );

      const csvContent = [headers.join(','), ...csvRows].join('\r\n');
      const bomCsv = '\uFEFF' + csvContent;

      if (Platform.OS === 'web') {
        const blob = new Blob([bomCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `JB51_Products_Analysis_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const fileUri = `${FileSystem.cacheDirectory}JB51_Products_Analysis_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, bomCsv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Products Analysis (Excel/CSV)',
          });
        }
      }
      showAlert?.('Export Complete', 'All products analysis CSV/Excel file ready', 'success');
    } catch (err: any) {
      console.error('Export Excel error:', err);
      showAlert?.('Export Failed', err.message || 'Unable to generate Excel file', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

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
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
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
              {analyticsOverview?.offlineOrderCount ?? 0} offline • {analyticsOverview?.orderCount ?? 0} total
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
              orders / views
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
            <Badge variant="outline" size="sm">Past 30 Days</Badge>
          </CardHeader>

          <CardContent>
            {/* Online vs Offline Ratio */}
            <View style={styles.ratioHeaderRow}>
              <View style={styles.ratioValBox}>
                <Badge
                  variant="blue"
                  icon={<Globe size={12} color="#2563eb" />}
                  style={styles.channelBadgeOnline}
                >
                  {`${channelRatioAnalytics?.onlineRatio ?? analyticsOverview?.channelRatio?.onlineRatio ?? 0}% Online`}
                </Badge>
                <Text style={styles.ratioLblText}>
                  {channelRatioAnalytics?.onlineOrderCount ?? analyticsOverview?.onlineOrderCount ?? 0} orders
                </Text>
              </View>
              <View style={[styles.ratioValBox, { alignItems: 'flex-end' }]}>
                <Badge
                  variant="amber"
                  icon={<Store size={12} color="#d97706" />}
                  style={styles.channelBadgeOffline}
                >
                  {`${channelRatioAnalytics?.offlineRatio ?? analyticsOverview?.channelRatio?.offlineRatio ?? 0}% Walk-in`}
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
                  <View style={styles.growthHeaderTitleRow}>
                    <Layers size={11} color="#64748b" />
                    <Text style={styles.growthBoxLbl} numberOfLines={1}>
                      Total
                    </Text>
                  </View>
                </View>
                <View style={styles.growthValRow}>
                  <Text style={styles.growthBoxVal}>
                    {growthPulseAnalytics?.current30DaysOrders ?? analyticsOverview?.growth?.current30DaysOrders ?? 0}
                  </Text>
                  <Badge
                    size="sm"
                    variant={
                      (growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={9} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={9} color="#dc2626" />
                      )
                    }
                    style={styles.growthBadge}
                  >
                    {`${(growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.totalOrderGrowth ?? analyticsOverview?.growth?.totalOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxSub} numberOfLines={1}>
                  prev 30d: {growthPulseAnalytics?.previous30DaysOrders ?? analyticsOverview?.growth?.previous30DaysOrders ?? 0}
                </Text>
              </View>

              {/* Online Order Growth */}
              <View style={styles.growthBox}>
                <View style={styles.growthBoxHeader}>
                  <View style={styles.growthHeaderTitleRow}>
                    <Globe size={11} color="#2563eb" />
                    <Text style={styles.growthBoxLbl} numberOfLines={1}>
                      Online
                    </Text>
                  </View>
                </View>
                <View style={styles.growthValRow}>
                  <Text style={styles.growthBoxVal}>
                    {growthPulseAnalytics?.current30DaysOnline ?? analyticsOverview?.growth?.current30DaysOnline ?? 0}
                  </Text>
                  <Badge
                    size="sm"
                    variant={
                      (growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={9} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={9} color="#dc2626" />
                      )
                    }
                    style={styles.growthBadge}
                  >
                    {`${(growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.onlineOrderGrowth ?? analyticsOverview?.growth?.onlineOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxSub} numberOfLines={1}>
                  prev 30d: {growthPulseAnalytics?.previous30DaysOnline ?? analyticsOverview?.growth?.previous30DaysOnline ?? 0}
                </Text>
              </View>

              {/* Offline Order Growth */}
              <View style={styles.growthBox}>
                <View style={styles.growthBoxHeader}>
                  <View style={styles.growthHeaderTitleRow}>
                    <Store size={11} color="#d97706" />
                    <Text style={styles.growthBoxLbl} numberOfLines={1}>
                      Walk-in
                    </Text>
                  </View>
                </View>
                <View style={styles.growthValRow}>
                  <Text style={styles.growthBoxVal}>
                    {growthPulseAnalytics?.current30DaysOffline ?? analyticsOverview?.growth?.current30DaysOffline ?? 0}
                  </Text>
                  <Badge
                    size="sm"
                    variant={
                      (growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0
                        ? 'success'
                        : 'destructive'
                    }
                    icon={
                      (growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight size={9} color="#16a34a" />
                      ) : (
                        <ArrowDownRight size={9} color="#dc2626" />
                      )
                    }
                    style={styles.growthBadge}
                  >
                    {`${(growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0) >= 0 ? '+' : ''}${growthPulseAnalytics?.offlineOrderGrowth ?? analyticsOverview?.growth?.offlineOrderGrowth ?? 0}%`}
                  </Badge>
                </View>
                <Text style={styles.growthBoxSub} numberOfLines={1}>
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
          <CardHeader style={styles.paymentMainHeader}>
            <View style={styles.analysisHeaderLeft}>
              <CreditCard size={15} color="#10B981" />
              <CardTitle>Customer Payment Modes</CardTitle>
            </View>
            <Badge variant="secondary" size="sm" style={styles.paymentTotalBadge}>
              {`₹${(paymentModesAnalytics?.totalAmount ?? analyticsOverview?.payments?.totalAmount ?? 0).toLocaleString('en-IN')} Total`}
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
                <View style={styles.paymentCardTitleRow}>
                  <View style={[styles.paymentDot, { backgroundColor: '#2563eb' }]} />
                  <Text style={styles.paymentCardTitle} numberOfLines={1}>
                    Online
                  </Text>
                </View>
                <Text
                  style={styles.paymentCardAmount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ₹{(paymentModesAnalytics?.onlineAmount ?? analyticsOverview?.payments?.onlineAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Badge variant="blue" size="sm" style={styles.paymentBadgeSm}>
                  {`${paymentModesAnalytics?.onlineShare ?? analyticsOverview?.payments?.onlineShare ?? 0}%`}
                </Badge>
                <Text style={styles.paymentCardSub} numberOfLines={1}>
                  {paymentModesAnalytics?.onlineCount ?? analyticsOverview?.payments?.onlineCount ?? 0} orders
                </Text>
              </View>

              {/* Cash Payment */}
              <View style={styles.paymentCardItem}>
                <View style={styles.paymentCardTitleRow}>
                  <View style={[styles.paymentDot, { backgroundColor: '#16a34a' }]} />
                  <Text style={styles.paymentCardTitle} numberOfLines={1}>
                    Cash
                  </Text>
                </View>
                <Text
                  style={styles.paymentCardAmount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ₹{(paymentModesAnalytics?.cashAmount ?? analyticsOverview?.payments?.cashAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Badge variant="success" size="sm" style={styles.paymentBadgeSm}>
                  {`${paymentModesAnalytics?.cashShare ?? analyticsOverview?.payments?.cashShare ?? 0}%`}
                </Badge>
                <Text style={styles.paymentCardSub} numberOfLines={1}>
                  {paymentModesAnalytics?.cashCount ?? analyticsOverview?.payments?.cashCount ?? 0} orders
                </Text>
              </View>

              {/* Credit Payment */}
              <View style={styles.paymentCardItem}>
                <View style={styles.paymentCardTitleRow}>
                  <View style={[styles.paymentDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.paymentCardTitle} numberOfLines={1}>
                    Credit
                  </Text>
                </View>
                <Text
                  style={styles.paymentCardAmount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ₹{(paymentModesAnalytics?.creditAmount ?? analyticsOverview?.payments?.creditAmount ?? 0).toLocaleString('en-IN')}
                </Text>
                <Badge variant="amber" size="sm" style={styles.paymentBadgeSm}>
                  {`${paymentModesAnalytics?.creditShare ?? analyticsOverview?.payments?.creditShare ?? 0}%`}
                </Badge>
                <Text style={styles.paymentCardSub} numberOfLines={1}>
                  {paymentModesAnalytics?.creditCount ?? analyticsOverview?.payments?.creditCount ?? 0} orders
                </Text>
              </View>
            </View>

            {/* Credit Note summary if there's due balance */}
            {((paymentModesAnalytics?.creditDueAmount ?? analyticsOverview?.payments?.creditDueAmount ?? 0) > 0 ||
              (paymentModesAnalytics?.creditPaidAmount ?? analyticsOverview?.payments?.creditPaidAmount ?? 0) > 0) && (
              <Text style={styles.creditNoteText}>
                Outstanding Credit: ₹{(paymentModesAnalytics?.creditDueAmount ?? analyticsOverview?.payments?.creditDueAmount ?? 0).toLocaleString('en-IN')} pending • ₹{(paymentModesAnalytics?.creditPaidAmount ?? analyticsOverview?.payments?.creditPaidAmount ?? 0).toLocaleString('en-IN')} settled
              </Text>
            )}
          </CardContent>
        </Card>

        {/* 3. Inventory Stock Pulse */}
        {inventorySummaryAnalytics && (
          <Card>
            <CardHeader style={styles.inventoryMainHeader}>
              <View style={styles.analysisHeaderLeft}>
                <Package size={15} color="#059669" />
                <CardTitle>Inventory Health Summary</CardTitle>
              </View>
              <TouchableOpacity onPress={() => onNavigateToTab?.('inventory')} activeOpacity={0.7}>
                <Badge variant="outline" size="sm">
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#FF5E36' }}>Manage Stock →</Text>
                </Badge>
              </TouchableOpacity>
            </CardHeader>
            <CardContent>
              <View style={styles.inventoryHealthGrid}>
                {/* In Stock Card */}
                <View style={styles.inventoryHealthCard}>
                  <View style={styles.inventoryCardHeaderRow}>
                    <View style={[styles.inventoryCardDot, { backgroundColor: '#16a34a' }]} />
                    <Text style={styles.inventoryCardTitle} numberOfLines={1}>In Stock</Text>
                  </View>
                  <Text
                    style={[styles.inventoryCardVal, { color: '#16a34a' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {inventorySummaryAnalytics.inStockProducts}
                  </Text>
                  <Text style={styles.inventoryCardSub} numberOfLines={1}>
                    Products
                  </Text>
                </View>

                {/* Low Stock Card */}
                <View style={styles.inventoryHealthCard}>
                  <View style={styles.inventoryCardHeaderRow}>
                    <View style={[styles.inventoryCardDot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.inventoryCardTitle} numberOfLines={1}>Low Stock</Text>
                  </View>
                  <Text
                    style={[styles.inventoryCardVal, { color: '#f59e0b' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {inventorySummaryAnalytics.lowStockProducts}
                  </Text>
                  <Text style={styles.inventoryCardSub} numberOfLines={1}>
                    Need Refill
                  </Text>
                </View>

                {/* Total Units Card */}
                <View style={styles.inventoryHealthCard}>
                  <View style={styles.inventoryCardHeaderRow}>
                    <View style={[styles.inventoryCardDot, { backgroundColor: '#2563eb' }]} />
                    <Text style={styles.inventoryCardTitle} numberOfLines={1}>Units</Text>
                  </View>
                  <Text
                    style={[styles.inventoryCardVal, { color: '#2563eb' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {inventorySummaryAnalytics.totalStockUnits}
                  </Text>
                  <Text style={styles.inventoryCardSub} numberOfLines={1}>
                    In Stock
                  </Text>
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
                      <Badge
                        variant="secondary"
                        size="icon"
                        icon={<Sparkles size={11} color="#64748b" />}
                      />
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
                      <Badge
                        variant="amber"
                        size="icon"
                        icon={<Flame size={11} color="#d97706" />}
                      />
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
                      <Badge
                        variant="success"
                        size="icon"
                        icon={<TrendingUp size={11} color="#16a34a" />}
                      />
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  width: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Eye size={15} color="#FF5E36" />
                  <View>
                    <CardTitle>Catalogue Telemetry</CardTitle>
                    <CardDescription>
                      Tap product to focus individual analytics
                    </CardDescription>
                  </View>
                </View>

                {/* Export Actions Toolbar */}
                <View style={styles.catalogueHeaderActions}>

                  <TouchableOpacity
                    onPress={handleExportPdf}
                    disabled={isExportingPdf}
                    style={[styles.actionBtnSm, styles.actionBtnPdfSm]}
                    activeOpacity={0.7}
                  >
                    {isExportingPdf ? (
                      <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                      <FileText size={11} color="#dc2626" />
                    )}
                    <Text style={styles.actionBtnPdfTextSm}>PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleExportExcel}
                    disabled={isExportingExcel}
                    style={[styles.actionBtnSm, styles.actionBtnExcelSm]}
                    activeOpacity={0.7}
                  >
                    {isExportingExcel ? (
                      <ActivityIndicator size="small" color="#16a34a" />
                    ) : (
                      <FileSpreadsheet size={11} color="#16a34a" />
                    )}
                    <Text style={styles.actionBtnExcelTextSm}>Excel</Text>
                  </TouchableOpacity>
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
                    <Text
                      style={{
                        fontSize: 8,
                        color: '#71717a',
                        marginTop: 2,
                        textAlign: 'center',
                      }}
                    >
                      online conv
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Full View Banner Link */}
              <TouchableOpacity
                onPress={() => setShowFullAnalysisModal(true)}
                style={styles.fullViewBannerBtn}
                activeOpacity={0.7}
              >
                <Maximize2 size={13} color="#ea580c" />
                <Text style={styles.fullViewBannerText}>
                  View All Products Analysis ({productPerformanceList.length} items)
                </Text>
                <ArrowRight size={13} color="#ea580c" />
              </TouchableOpacity>
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

    {/* Full View All Products Analysis Modal */}
    <Modal
      visible={showFullAnalysisModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFullAnalysisModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Eye size={17} color="#FF5E36" />
              <View>
                <Text style={styles.modalTitle}>All Products Telemetry</Text>
                <Text style={styles.modalSubtitle}>
                  {productPerformanceList.length} products tracked • Full storewide telemetry
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowFullAnalysisModal(false)}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Export Action Toolbar */}
          <View style={styles.modalToolbar}>
            <View style={styles.modalExportGroup}>
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={isExportingPdf}
                style={[styles.modalExportBtn, styles.modalExportBtnPdf]}
                activeOpacity={0.7}
              >
                {isExportingPdf ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <FileText size={13} color="#dc2626" />
                )}
                <Text style={styles.modalExportTextPdf}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportExcel}
                disabled={isExportingExcel}
                style={[styles.modalExportBtn, styles.modalExportBtnExcel]}
                activeOpacity={0.7}
              >
                {isExportingExcel ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <FileSpreadsheet size={13} color="#16a34a" />
                )}
                <Text style={styles.modalExportTextExcel}>Export Excel (CSV)</Text>
              </TouchableOpacity>
            </View>

            <Badge variant="secondary" size="sm">
              {`${filteredModalProducts.length} shown`}
            </Badge>
          </View>

          {/* Aggregate Telemetry Ribbon */}
          <View style={styles.modalSummaryRow}>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>{productPerformanceList.length}</Text>
              <Text style={styles.modalSummaryLbl}>Outfits</Text>
            </View>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>{modalSummaryStats.totalViews}</Text>
              <Text style={styles.modalSummaryLbl}>Views</Text>
            </View>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>{modalSummaryStats.totalInquiries}</Text>
              <Text style={styles.modalSummaryLbl}>Inquiries</Text>
            </View>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>{modalSummaryStats.totalOrders}</Text>
              <Text style={styles.modalSummaryLbl}>Orders</Text>
            </View>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>{modalSummaryStats.overallConv}%</Text>
              <Text style={styles.modalSummaryLbl}>Conv Rate</Text>
            </View>
            <View style={styles.modalSummaryItem}>
              <Text style={styles.modalSummaryVal}>
                ₹{modalSummaryStats.totalRevenue.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.modalSummaryLbl}>Revenue</Text>
            </View>
          </View>

          {/* Search Filter & Sort Chips */}
          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchInputWrapper}>
              <Search size={14} color="#94a3b8" />
              <TextInput
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
                placeholder="Search outfit name or category..."
                placeholderTextColor="#94a3b8"
                style={styles.modalSearchInput}
                clearButtonMode="while-editing"
              />
              {modalSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setModalSearchQuery('')}>
                  <X size={13} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sort Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modalSortChipsRow}
            >
              {(
                [
                  { key: 'views', label: 'Top Views' },
                  { key: 'inquiries', label: 'Most Inquiries' },
                  { key: 'orders', label: 'Most Orders' },
                  { key: 'conversion', label: 'Highest Conv.' },
                  { key: 'revenue', label: 'Top Revenue' },
                ] as const
              ).map((chip) => {
                const isActive = modalSortKey === chip.key;
                return (
                  <TouchableOpacity
                    key={chip.key}
                    onPress={() => setModalSortKey(chip.key)}
                    style={[
                      styles.modalSortChip,
                      isActive && styles.modalSortChipActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalSortChipText,
                        isActive && styles.modalSortChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Scrollable Products Telemetry List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalProductList}
            keyboardShouldPersistTaps="handled"
          >
            {filteredModalProducts.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
                <Search size={28} color="#cbd5e1" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>
                  No matching products found
                </Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                  Try a different search keyword
                </Text>
              </View>
            ) : (
              filteredModalProducts.map((p, idx) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    setSelectedAnalyticsSlug(p.slug);
                    setShowFullAnalysisModal(false);
                  }}
                  activeOpacity={0.7}
                  style={styles.modalProductCard}
                >
                  {/* Top Row: Rank, Image, Name & Conv Badge */}
                  <View style={styles.modalProductCardTop}>
                    <View style={styles.modalRankBadge}>
                      <Text
                        style={[
                          styles.modalRankText,
                          idx < 3 && styles.actionBtnHighlightTextSm,
                        ]}
                      >
                        #{idx + 1}
                      </Text>
                    </View>

                    {p.image ? (
                      <Image source={{ uri: p.image }} style={styles.modalProductImg} />
                    ) : (
                      <View style={styles.modalProductImgFallback}>
                        <Award size={14} color="#94a3b8" />
                      </View>
                    )}

                    <View style={styles.modalProductDetails}>
                      <Text style={styles.modalProductName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={styles.modalProductCategory} numberOfLines={1}>
                        {p.category}
                      </Text>
                      <Text style={styles.modalProductPrice}>
                        ₹{(p.price || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>

                    <Badge variant="success" size="sm">
                      {`${p.onlineOrderConversionRate ?? 0}% conv`}
                    </Badge>
                  </View>

                  {/* Telemetry Metrics Grid */}
                  <View style={styles.modalProductStatsGrid}>
                    <View style={styles.modalProductStatBox}>
                      <Text style={styles.modalProductStatVal}>{p.views}</Text>
                      <Text style={styles.modalProductStatLbl}>Views</Text>
                    </View>

                    <View style={styles.modalProductStatBox}>
                      <Text style={styles.modalProductStatVal}>{p.totalClicks}</Text>
                      <Text style={styles.modalProductStatLbl}>Inquiries</Text>
                      <Text style={styles.modalProductStatSub}>
                        {p.whatsappClicks}w • {p.instagramClicks}i
                      </Text>
                    </View>

                    <View style={styles.modalProductStatBox}>
                      <Text style={[styles.modalProductStatVal, { color: '#2563eb' }]}>
                        {p.onlineOrderCount ?? 0}
                      </Text>
                      <Text style={styles.modalProductStatLbl}>Online Orders</Text>
                      <Text style={styles.modalProductStatSub}>
                        {p.offlineOrderCount ?? 0} off • {p.orderCount} tot
                      </Text>
                    </View>

                    <View style={styles.modalProductStatBox}>
                      <Text style={[styles.modalProductStatVal, { color: '#16a34a' }]}>
                        {p.onlineOrderConversionRate ?? 0}%
                      </Text>
                      <Text style={styles.modalProductStatLbl}>Conversion</Text>
                    </View>
                  </View>

                  {/* Revenue Row */}
                  <View style={styles.modalProductRevenueRow}>
                    <Text style={styles.modalProductRevenueLbl}>
                      Online: ₹{(p.onlineRevenue ?? 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.modalProductRevenueVal}>
                      Total Rev: ₹{(p.totalRevenue ?? 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </View>
  );
}
