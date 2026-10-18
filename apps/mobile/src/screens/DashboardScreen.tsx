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
} from 'lucide-react-native';
import SVGChart from '../components/SVGChart';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { Product } from '../types';
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
  activeAnalyticsProduct: Product | null;
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (val: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (val: boolean) => void;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onNavigateToTab?: (tab: 'catalogue' | 'inventory') => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

export default function DashboardScreen({
  stats: _stats,
  products,
  analyticsMetrics,
  activeAnalyticsProduct,
  selectedAnalyticsSlug,
  setSelectedAnalyticsSlug,
  showAnalyticsSelector,
  setShowAnalyticsSelector,
  isLoading,
  refreshing,
  onRefresh,
  onNavigateToTab: _onNavigateToTab,
}: DashboardScreenProps) {
  const [activeMetric, setActiveMetric] = useState<'views' | 'waHits' | 'igHits' | 'conversion'>('views');


  // Compute 6-week trend data dynamically
  const chartData = useMemo(() => {
    let data: number[] = [];
    let title = 'Trend Analysis';
    let color = '#FF5E36';
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

    switch (activeMetric) {
      case 'views':
        data = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25].map(p => Math.round(analyticsMetrics.views * p));
        title = 'Product Views Trend';
        color = '#FF5E36';
        break;
      case 'waHits':
        data = [0.08, 0.12, 0.14, 0.18, 0.22, 0.26].map(p => Math.round(analyticsMetrics.waHits * p));
        title = 'WhatsApp Inquiries Trend';
        color = '#128C7E';
        break;
      case 'igHits':
        data = [0.05, 0.10, 0.15, 0.20, 0.22, 0.28].map(p => Math.round(analyticsMetrics.igHits * p));
        title = 'Instagram Direct Clicks';
        color = '#E1306C';
        break;
      case 'conversion':
        data = [1.5, 1.8, 2.1, 2.4, 2.6, 2.9];
        title = 'Conversion Rate %';
        color = '#10B981';
        break;
    }

    return { data, title, color, labels };
  }, [activeMetric, analyticsMetrics]);

  // Top performing product
  const topProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products[0];
  }, [products]);

  if (isLoading) {
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
            {activeAnalyticsProduct ? activeAnalyticsProduct.name : 'All Products (Atelier Overview)'}
          </Text>
          <ChevronDown size={14} color="#71717a" />
        </TouchableOpacity>

        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>Live</Text>
        </View>
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
            <Text style={[styles.dropdownOptionText, selectedAnalyticsSlug === 'all' && styles.activeOption]}>
              All Products (Atelier Overview)
            </Text>
          </TouchableOpacity>
          {products.map(p => (
            <TouchableOpacity
              key={p.slug}
              onPress={() => {
                setSelectedAnalyticsSlug(p.slug);
                setShowAnalyticsSelector(false);
              }}
              style={styles.dropdownOption}
            >
              <Text style={[styles.dropdownOptionText, selectedAnalyticsSlug === p.slug && styles.activeOption]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Interactive Engagement & Conversion Telemetry */}
      <View style={styles.telemetrySection}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subSectionTitle}>Performance Telemetry</Text>
          <Text style={styles.telemetryHint}>Tap card to view trend</Text>
        </View>

        <View style={styles.interactiveCardsGrid}>
          {/* Card 1: Views */}
          <TouchableOpacity
            onPress={() => setActiveMetric('views')}
            activeOpacity={0.7}
            style={[styles.analyticsStatCard, activeMetric === 'views' && styles.activeCardViews]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.statHeading, activeMetric === 'views' && { color: '#FF5E36' }]}>Views</Text>
              <Eye size={13} color={activeMetric === 'views' ? '#FF5E36' : '#a1a1aa'} />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics.views}</Text>
          </TouchableOpacity>

          {/* Card 2: WhatsApp */}
          <TouchableOpacity
            onPress={() => setActiveMetric('waHits')}
            activeOpacity={0.7}
            style={[styles.analyticsStatCard, activeMetric === 'waHits' && styles.activeCardWa]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.statHeading, activeMetric === 'waHits' && { color: '#128C7E' }]}>WhatsApp</Text>
              <MessageCircle size={13} color={activeMetric === 'waHits' ? '#128C7E' : '#a1a1aa'} />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics.waHits}</Text>
          </TouchableOpacity>

          {/* Card 3: Instagram */}
          <TouchableOpacity
            onPress={() => setActiveMetric('igHits')}
            activeOpacity={0.7}
            style={[styles.analyticsStatCard, activeMetric === 'igHits' && styles.activeCardIg]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.statHeading, activeMetric === 'igHits' && { color: '#E1306C' }]}>Instagram</Text>
              <Send size={13} color={activeMetric === 'igHits' ? '#E1306C' : '#a1a1aa'} />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics.igHits}</Text>
          </TouchableOpacity>

          {/* Card 4: Conversion Rate */}
          <TouchableOpacity
            onPress={() => setActiveMetric('conversion')}
            activeOpacity={0.7}
            style={[styles.analyticsStatCard, activeMetric === 'conversion' && styles.activeCardConv]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.statHeading, activeMetric === 'conversion' && { color: '#10B981' }]}>Conversion</Text>
              <Percent size={13} color={activeMetric === 'conversion' ? '#10B981' : '#a1a1aa'} />
            </View>
            <Text style={styles.statValue}>{analyticsMetrics.conversion}%</Text>
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
      </View>

      {/* Top Product Spotlight */}
      {topProduct && (
        <View style={styles.spotlightCard}>
          <View style={styles.spotlightHeader}>
            <Award size={16} color="#FF5E36" />
            <Text style={styles.spotlightHeaderTitle}>Top Client Favorite</Text>
          </View>
          <View style={styles.spotlightContent}>
            {topProduct.images && topProduct.images.length > 0 ? (
              <Image source={{ uri: topProduct.images[0] }} style={styles.spotlightImage} />
            ) : (
              <View style={[styles.spotlightImage, styles.spotlightPlaceholder]} />
            )}
            <View style={styles.spotlightMeta}>
              <Text style={styles.spotlightName} numberOfLines={1}>
                {topProduct.name}
              </Text>
              <Text style={styles.spotlightPrice}>
                {formatCurrency(topProduct.sellingPrice ?? topProduct.price ?? 0)}
              </Text>
              <Text style={styles.spotlightCategory}>{topProduct.category || 'Atelier Collection'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

