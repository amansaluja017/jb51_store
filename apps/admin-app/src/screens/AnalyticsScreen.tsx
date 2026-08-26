import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import SVGChart from '../components/SVGChart';
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

  // Seed views over 6 weeks: 120, 145, 130, 165, 185, 240
  // Inquiries: 12, 18, 14, 25, 29, 42
  const viewsPoints = "20,120 70,105 120,115 170,90 220,78 270,30";
  const inqPoints = "20,175 70,168 120,172 170,158 220,152 270,135";

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

      {/* Metrics Cards Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.analyticsStatCard}>
          <Text style={styles.statHeading}>Product Views</Text>
          <Text style={styles.statValue}>{analyticsMetrics.views}</Text>
        </View>
        <View style={styles.analyticsStatCard}>
          <Text style={styles.statHeading}>WhatsApp Clicks</Text>
          <Text style={styles.statValue}>{analyticsMetrics.waHits}</Text>
        </View>
        <View style={styles.analyticsStatCard}>
          <Text style={styles.statHeading}>Instagram DMs</Text>
          <Text style={styles.statValue}>{analyticsMetrics.igHits}</Text>
        </View>
        <View style={styles.analyticsStatCard}>
          <Text style={styles.statHeading}>Conversion Rate</Text>
          <Text style={styles.statValue}>{analyticsMetrics.conversion}%</Text>
        </View>
      </View>

      {/* Custom SVG Performance Chart */}
      <SVGChart 
        viewsPoints={viewsPoints}
        inqPoints={inqPoints}
      />

      {/* Sizing Distribution Table */}
      <View style={styles.tableCard}>
        <Text style={styles.cardTitle}>Sizing Variant Performance</Text>
        <Text style={styles.cardSub}>Individual sizing analytics breakdown</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1 }]}>Size</Text>
            <Text style={[styles.th, { flex: 2 }]}>Interest Level</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Pipeline Est.</Text>
          </View>

          {['XS', 'S', 'M', 'L', 'XL'].map((sz, idx) => {
            const interest = idx === 2 ? 'Exceptional' : idx === 1 || idx === 3 ? 'High' : 'Moderate';
            const interestColor = idx === 2 ? '#ef4444' : idx === 1 || idx === 3 ? '#FF5E36' : '#71717a';
            return (
              <View key={sz} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1, fontWeight: 'bold' }]}>{sz}</Text>
                <Text style={[styles.td, { flex: 2, color: interestColor }]}>{interest}</Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: 'semibold' }]}>
                  {formatCurrency(analyticsMetrics.pipeline / 5)}
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
  statHeading: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#09090b',
    marginTop: 4,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09090b',
  },
  cardSub: {
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
