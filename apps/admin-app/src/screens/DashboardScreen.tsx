import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Package, Sparkles, AlertCircle, MessageCircle } from 'lucide-react-native';
import MetricCard from '../components/MetricCard';
import InquiryItem from '../components/InquiryItem';
import { Inquiry } from '../types';

interface DashboardScreenProps {
  stats: {
    total: number;
    listed: number;
    oos: number;
    active: number;
  };
  inquiries: Inquiry[];
  onResolveInquiry: (id: string, name: string) => void;
}

export default function DashboardScreen({
  stats,
  inquiries,
  onResolveInquiry
}: DashboardScreenProps) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPadding}>
      <Text style={styles.sectionHeader}>Overview Metrics</Text>
      
      {/* Metric Cards Grid */}
      <View style={styles.metricsGrid}>
        <MetricCard 
          icon={<Package size={16} color="#FF5E36" />}
          value={stats.total}
          label="Total Catalogue"
          badgeText="Active"
          badgeStyle="default"
        />
        <MetricCard 
          icon={<Sparkles size={16} color="#FF5E36" />}
          value={stats.listed}
          label="Visible Online"
          badgeText="Listed"
          badgeStyle="default"
        />
        <MetricCard 
          icon={<AlertCircle size={16} color="#FF5E36" />}
          value={stats.oos}
          label="Out of Stock"
          badgeText={stats.oos > 0 ? 'Attention' : 'Stable'}
          badgeStyle={stats.oos > 0 ? 'alert' : 'stable'}
        />
        <MetricCard 
          icon={<MessageCircle size={16} color="#FF5E36" />}
          value={284}
          label="Concierge Clicks"
          badgeText="+14% wk"
          badgeStyle="default"
        />
      </View>

      {/* Inquiries */}
      <View style={styles.inquiriesContainer}>
        <View style={styles.inquiriesHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>Atelier Inquiries</Text>
            <Text style={styles.cardSub}>Direct chats initiated by luxury clients</Text>
          </View>
        </View>

        <View style={styles.inquiryList}>
          {inquiries.map((inq) => (
            <InquiryItem 
              key={inq.id}
              inquiry={inq}
              onResolve={onResolveInquiry}
            />
          ))}
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
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#71717a',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  inquiriesContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 24,
    padding: 20,
  },
  inquiriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  inquiryList: {
    gap: 12,
  },
});
