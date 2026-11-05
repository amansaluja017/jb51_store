import React from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAppDataContext } from '../../src/context/AppDataContext';
import DashboardScreen from '../../src/screens/DashboardScreen';

export default function IndexScreen() {
  const data = useAppDataContext();
  const router = useRouter();

  return (
    <DashboardScreen
      stats={data.stats}
      products={data.products}
      analyticsMetrics={data.analyticsMetrics}
      analyticsOverview={data.analyticsOverview}
      allProductsAnalytics={data.allProductsAnalytics}
      viewsAnalytics={data.viewsAnalytics}
      clicksAnalytics={data.clicksAnalytics}
      conversionAnalytics={data.conversionAnalytics}
      funnelAnalytics={data.funnelAnalytics}
      channelRatioAnalytics={data.channelRatioAnalytics}
      growthPulseAnalytics={data.growthPulseAnalytics}
      paymentModesAnalytics={data.paymentModesAnalytics}
      demandHighlightsAnalytics={data.demandHighlightsAnalytics}
      catalogueTelemetryAnalytics={data.catalogueTelemetryAnalytics}
      inventorySummaryAnalytics={data.inventorySummaryAnalytics}
      fetchPaginatedCatalogueTelemetry={data.fetchPaginatedCatalogueTelemetry}
      activeAnalyticsProduct={data.activeAnalyticsProduct}
      selectedAnalyticsSlug={data.selectedAnalyticsSlug}
      setSelectedAnalyticsSlug={data.setSelectedAnalyticsSlug}
      showAnalyticsSelector={data.showAnalyticsSelector}
      setShowAnalyticsSelector={data.setShowAnalyticsSelector}
      isLoading={data.isLoading}
      isLoadingAnalytics={data.isLoadingAnalytics}
      refreshing={data.refreshing}
      onRefresh={data.handleRefresh}
      onNavigateToTab={(tab) => {
        data.setActiveTab(tab);
        if (tab === 'catalogue') {
          router.replace('/products-catalog');
        } else if (tab === 'inventory') {
          router.replace('/stock');
        }
      }}
      showAlert={data.showAlert}
    />
  );
}

