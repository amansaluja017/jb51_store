import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Package, Sparkles, AlertCircle, MessageCircle, Plus } from 'lucide-react-native';
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
  onSimulateInquiry: () => void;
}

export default function DashboardScreen({
  stats,
  inquiries,
  onResolveInquiry,
  onSimulateInquiry
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
          <TouchableOpacity 
            onPress={onSimulateInquiry} 
            style={styles.simulateBtn}
            activeOpacity={0.7}
          >
            <Plus size={11} color="#FF5E36" />
            <Text style={styles.simulateBtnText}>Simulate</Text>
          </TouchableOpacity>
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
    marginTop: 10,
  },
  inquiriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09090b',
  },
  cardSub: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 2,
  },
  inquiryList: {
    gap: 10,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 54, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fff7f5',
  },
  simulateBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
});
