import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { ChevronDown, Eye, MessageCircle, Send, Percent } from 'lucide-react-native';
import SVGChart from '../components/SVGChart';
import SizingChart from '../components/SizingChart';
import { Product } from '../types';

interface AnalyticsScreenProps {
  products: Product[];
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (val: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (val: boolean) => void;
  analyticsMetrics: {
    views: number;
    waHits: number;
    igHits: number;
    wlHits: number;
    conversion: number;
    pipeline: number;
  };
  activeAnalyticsProduct: Product | null;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

export default function AnalyticsScreen({
  products,
  selectedAnalyticsSlug,
  setSelectedAnalyticsSlug,
  showAnalyticsSelector,
  setShowAnalyticsSelector,
  analyticsMetrics,
  activeAnalyticsProduct
}: AnalyticsScreenProps) {
  
  // Active metric for charting
  const [activeMetric, setActiveMetric] = useState<'views' | 'waHits' | 'igHits' | 'conversion'>('views');

  // Compute sizing distribution values dynamically based on selected product
  const sizingValues = useMemo(() => {
    if (activeAnalyticsProduct) {
      const seed = activeAnalyticsProduct.slug.charCodeAt(0) || 10;
      return [
        20 + (seed * 3) % 25,  // XS
        40 + (seed * 5) % 25,  // S
        75 + (seed * 2) % 20,  // M (typically best seller)
        50 + (seed * 7) % 25,  // L
        15 + (seed * 4) % 20   // XL
      ];
    }
    return [25, 55, 85, 65, 30]; // defaults for atelier overview
  }, [activeAnalyticsProduct]);

  // Compute 6-week trend data dynamically based on the selected metric and product totals
  const chartData = useMemo(() => {
    let data: number[] = [];
    let title = 'Trend Analysis';
    let color = '#FF5E36';
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    
    switch (activeMetric) {
      case 'views':
        data = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25].map(p => Math.round(analyticsMetrics.views * p));
        title = 'Product Views Trend';
        color = '#FF5E36'; // Orange-Peach
        break;
      case 'waHits':
        data = [0.08, 0.12, 0.14, 0.18, 0.22, 0.26].map(p => Math.round(analyticsMetrics.waHits * p));
        title = 'WhatsApp Inquiries Trend';
        color = '#128C7E'; // WhatsApp Teal/Green
        break;
      case 'igHits':
        data = [0.10, 0.11, 0.13, 0.17, 0.21, 0.28].map(p => Math.round(analyticsMetrics.igHits * p));
        title = 'Instagram DM Inquiries Trend';
        color = '#E1306C'; // Instagram Pink
        break;
      case 'conversion':
        const base = analyticsMetrics.conversion;
        data = [
          Math.max(1, Math.round(base * 0.65)),
          Math.max(1, Math.round(base * 0.78)),
          Math.max(1, Math.round(base * 0.85)),
          Math.max(1, Math.round(base * 0.90)),
          Math.max(1, Math.round(base * 0.95)),
          base
        ];
        title = 'Conversion Rate Trend (%)';
        color = '#3B82F6'; // Blue
        break;
    }
    
    return { data, title, color, labels };
  }, [activeMetric, analyticsMetrics]);

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPadding}>
      {/* Selector Toggle */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Outfit Focus:</Text>
        <TouchableOpacity 
          onPress={() => setShowAnalyticsSelector(!showAnalyticsSelector)}
          style={styles.selectorButton}
        >
          <Text style={styles.selectorButtonText}>
            {activeAnalyticsProduct ? activeAnalyticsProduct.name : 'All Outfits (Atelier Overview)'}
          </Text>
          <ChevronDown size={14} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Selector Options Menu */}
      {showAnalyticsSelector && (
        <View style={styles.dropdownPickerList}>
          <TouchableOpacity 
            onPress={() => { setSelectedAnalyticsSlug('all'); setShowAnalyticsSelector(false); }}
            style={styles.dropdownOption}
          >
            <Text style={[styles.dropdownOptionText, selectedAnalyticsSlug === 'all' && styles.activeOption]}>
              All Outfits (Atelier Overview)
            </Text>
          </TouchableOpacity>
          {products.map(p => (
            <TouchableOpacity 
              key={p.slug}
              onPress={() => { setSelectedAnalyticsSlug(p.slug); setShowAnalyticsSelector(false); }}
              style={styles.dropdownOption}
            >
              <Text style={[styles.dropdownOptionText, selectedAnalyticsSlug === p.slug && styles.activeOption]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Interactive Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Card 1: Views */}
        <TouchableOpacity 
          onPress={() => setActiveMetric('views')}
          activeOpacity={0.7}
          style={[
            styles.analyticsStatCard, 
            activeMetric === 'views' && styles.activeCardViews
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.statHeading}>Views</Text>
            <Eye size={12} color={activeMetric === 'views' ? '#FF5E36' : '#a1a1aa'} />
          </View>
          <Text style={styles.statValue}>{analyticsMetrics.views}</Text>
        </TouchableOpacity>

        {/* Card 2: WhatsApp */}
        <TouchableOpacity 
          onPress={() => setActiveMetric('waHits')}
          activeOpacity={0.7}
          style={[
            styles.analyticsStatCard, 
            activeMetric === 'waHits' && styles.activeCardWa
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.statHeading}>WhatsApp</Text>
            <MessageCircle size={12} color={activeMetric === 'waHits' ? '#128C7E' : '#a1a1aa'} />
          </View>
          <Text style={styles.statValue}>{analyticsMetrics.waHits}</Text>
        </TouchableOpacity>

        {/* Card 3: Instagram */}
        <TouchableOpacity 
          onPress={() => setActiveMetric('igHits')}
          activeOpacity={0.7}
          style={[
            styles.analyticsStatCard, 
            activeMetric === 'igHits' && styles.activeCardIg
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.statHeading}>Instagram</Text>
            <Send size={12} color={activeMetric === 'igHits' ? '#E1306C' : '#a1a1aa'} />
          </View>
          <Text style={styles.statValue}>{analyticsMetrics.igHits}</Text>
        </TouchableOpacity>

        {/* Card 4: Conversion */}
        <TouchableOpacity 
          onPress={() => setActiveMetric('conversion')}
          activeOpacity={0.7}
          style={[
            styles.analyticsStatCard, 
            activeMetric === 'conversion' && styles.activeCardConversion
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.statHeading}>Conversion</Text>
            <Percent size={12} color={activeMetric === 'conversion' ? '#3B82F6' : '#a1a1aa'} />
          </View>
          <Text style={styles.statValue}>{analyticsMetrics.conversion}%</Text>
        </TouchableOpacity>
      </View>

      {/* Main Performance Chart */}
      <SVGChart 
        activeMetric={activeMetric}
        metricData={chartData.data}
        labels={chartData.labels}
        title={chartData.title}
        color={chartData.color}
      />

      {/* Size Variant Performance Chart */}
      <SizingChart 
        values={sizingValues}
        color={chartData.color}
      />

      {/* Sizing Distribution Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Pipeline Projection by Size</Text>
        <Text style={styles.tableSub}>Estimated customer inquiry pipeline breakdown</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1 }]}>Size</Text>
            <Text style={[styles.th, { flex: 2 }]}>Interest Level</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Pipeline Est.</Text>
          </View>

          {['XS', 'S', 'M', 'L', 'XL'].map((sz, idx) => {
            const val = sizingValues[idx];
            const interest = val > 75 ? 'Exceptional' : val > 40 ? 'High' : 'Moderate';
            const interestColor = val > 75 ? '#ef4444' : val > 40 ? '#FF5E36' : '#71717a';
            return (
              <View key={sz} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1, fontWeight: 'bold' }]}>{sz}</Text>
                <Text style={[styles.td, { flex: 2, color: interestColor, fontWeight: '600' }]}>{interest}</Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: 'bold' }]}>
                  {formatCurrency(Math.round((analyticsMetrics.pipeline * (val / 250))))}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectorButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  dropdownPickerList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    gap: 4,
  },
  dropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: 'semibold',
  },
  activeOption: {
    color: '#FF5E36',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  analyticsStatCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statHeading: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#09090b',
    marginTop: 6,
  },
  activeCardViews: {
    borderColor: '#FF5E36',
    borderWidth: 1.5,
    backgroundColor: '#FF5E3605',
  },
  activeCardWa: {
    borderColor: '#128C7E',
    borderWidth: 1.5,
    backgroundColor: '#128C7E05',
  },
  activeCardIg: {
    borderColor: '#E1306C',
    borderWidth: 1.5,
    backgroundColor: '#E1306C05',
  },
  activeCardConversion: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
    backgroundColor: '#3B82F605',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  tableTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09090b',
  },
  tableSub: {
    fontSize: 9,
    color: '#71717a',
    marginTop: 2,
  },
  table: {
    marginTop: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    paddingBottom: 8,
  },
  th: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  td: {
    fontSize: 10,
    color: '#09090b',
  },
});
