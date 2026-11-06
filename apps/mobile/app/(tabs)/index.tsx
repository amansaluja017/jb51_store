import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTelemetry } from '../../src/context/TelemetryContext';
import { useUi } from '../../src/context/UiContext';
import DashboardScreen from '../../src/screens/DashboardScreen';

export default function IndexScreen() {
  const telemetry = useTelemetry();
  const ui = useUi();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!telemetry.analyticsOverview && !telemetry.isLoadingAnalytics) {
        telemetry.handleFetchAnalytics();
      }
    }, [
      telemetry.analyticsOverview,
      telemetry.isLoadingAnalytics,
      telemetry.handleFetchAnalytics,
    ])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await telemetry.handleFetchAnalytics(telemetry.selectedAnalyticsSlug, true);
    } finally {
      setRefreshing(false);
    }
  }, [telemetry.handleFetchAnalytics, telemetry.selectedAnalyticsSlug]);

  return (
    <DashboardScreen
      stats={telemetry.stats}
      analyticsMetrics={telemetry.analyticsMetrics}
      analyticsOverview={telemetry.analyticsOverview}
      allProductsAnalytics={telemetry.allProductsAnalytics}
      viewsAnalytics={telemetry.viewsAnalytics}
      clicksAnalytics={telemetry.clicksAnalytics}
      conversionAnalytics={telemetry.conversionAnalytics}
      funnelAnalytics={telemetry.funnelAnalytics}
      channelRatioAnalytics={telemetry.channelRatioAnalytics}
      growthPulseAnalytics={telemetry.growthPulseAnalytics}
      paymentModesAnalytics={telemetry.paymentModesAnalytics}
      demandHighlightsAnalytics={telemetry.demandHighlightsAnalytics}
      catalogueTelemetryAnalytics={telemetry.catalogueTelemetryAnalytics}
      inventorySummaryAnalytics={telemetry.inventorySummaryAnalytics}
      fetchPaginatedCatalogueTelemetry={telemetry.fetchPaginatedCatalogueTelemetry}
      activeAnalyticsProduct={telemetry.activeAnalyticsProduct}
      selectedAnalyticsSlug={telemetry.selectedAnalyticsSlug}
      setSelectedAnalyticsSlug={telemetry.setSelectedAnalyticsSlug}
      showAnalyticsSelector={telemetry.showAnalyticsSelector}
      setShowAnalyticsSelector={telemetry.setShowAnalyticsSelector}
      isLoading={telemetry.isLoadingAnalytics}
      isLoadingAnalytics={telemetry.isLoadingAnalytics}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onNavigateToTab={(tab) => {
        if (tab === 'catalogue') {
          router.replace('/products-catalog');
        } else if (tab === 'inventory') {
          router.replace('/stock');
        }
      }}
      showAlert={ui.showAlert}
    />
  );
}

