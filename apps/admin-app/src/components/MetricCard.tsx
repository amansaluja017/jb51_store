import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badgeText: string;
  badgeStyle?: 'default' | 'alert' | 'stable';
}

export default function MetricCard({ 
  icon, 
  value, 
  label, 
  badgeText, 
  badgeStyle = 'default' 
}: MetricCardProps) {
  const getBadgeStyle = () => {
    if (badgeStyle === 'alert') return [styles.trendBadge, styles.alertBadge];
    if (badgeStyle === 'stable') return [styles.trendBadge, styles.stableBadge];
    return styles.trendBadge;
  };

  return (
    <View style={styles.metricCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          {icon}
        </View>
        <Text style={getBadgeStyle()}>{badgeText}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  alertBadge: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
  },
  stableBadge: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
  },
  cardValue: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09090b',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: 'semibold',
    color: '#71717a',
    marginTop: 4,
  },
});
