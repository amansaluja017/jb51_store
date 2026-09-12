import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  dark?: boolean;
}

export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  dark = false,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        dark ? styles.darkBase : styles.lightBase,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  style,
  dark = false,
}: {
  size?: number;
  style?: ViewStyle | ViewStyle[];
  dark?: boolean;
}) {
  return <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} dark={dark} />;
}

export function SkeletonLine({
  width = '100%',
  height = 12,
  borderRadius = 6,
  style,
  dark = false,
}: SkeletonProps) {
  return <SkeletonBox width={width} height={height} borderRadius={borderRadius} style={style} dark={dark} />;
}

// -----------------------------------------------------------
// 1. Dashboard Skeleton
// -----------------------------------------------------------
export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Filter Row Placeholder */}
      <View style={[styles.rowBetween, { marginBottom: 14, gap: 10 }]}>
        <SkeletonBox width="74%" height={42} borderRadius={14} />
        <SkeletonBox width="22%" height={42} borderRadius={12} />
      </View>


      {/* Telemetry & Trend Box */}
      <View style={[styles.cardContainer, { marginTop: 14 }]}>
        <View style={styles.rowBetween}>
          <SkeletonLine width={140} height={14} />
          <SkeletonLine width={80} height={10} />
        </View>

        {/* 4 interactive telemetry chips */}
        <View style={[styles.grid2x2, { marginTop: 12 }]}>
          {[1, 2, 3, 4].map(idx => (
            <SkeletonBox key={idx} width="48%" height={52} borderRadius={12} />
          ))}
        </View>

        {/* Chart Box */}
        <SkeletonBox width="100%" height={150} borderRadius={14} style={{ marginTop: 14 }} />
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// 2. Catalog Skeleton
// -----------------------------------------------------------
export function CatalogSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <SkeletonBox width="100%" height={42} borderRadius={12} style={{ marginBottom: 10 }} />

      {/* Category Pills Scroll */}
      <View style={[styles.row, { gap: 8, marginBottom: 14 }]}>
        {[80, 65, 95, 75].map((w, idx) => (
          <SkeletonBox key={idx} width={w} height={30} borderRadius={16} />
        ))}
      </View>

      {/* Product Cards List */}
      <View style={{ gap: 14 }}>
        {[1, 2, 3].map(idx => (
          <View key={idx} style={styles.cardContainer}>
            <View style={[styles.row, { gap: 12 }]}>
              {/* Product Thumbnail */}
              <SkeletonBox width={72} height={86} borderRadius={12} />
              
              {/* Metadata */}
              <View style={{ flex: 1, gap: 7 }}>
                <SkeletonLine width="80%" height={15} />
                <SkeletonLine width="45%" height={12} />
                <View style={[styles.row, { gap: 8, marginTop: 4 }]}>
                  <SkeletonBox width={60} height={20} borderRadius={6} />
                  <SkeletonBox width={68} height={20} borderRadius={12} />
                </View>
              </View>
            </View>

            {/* Bottom Actions Skeleton */}
            <View style={[styles.rowBetween, { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
              <SkeletonBox width={90} height={28} borderRadius={8} />
              <View style={[styles.row, { gap: 8 }]}>
                <SkeletonCircle size={28} />
                <SkeletonCircle size={28} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// 3. Inventory Skeleton
// -----------------------------------------------------------
export function InventorySkeleton() {
  return (
    <View style={styles.container}>
      {/* KPI Dashboard Snapshot Skeleton */}
      <View style={[styles.cardContainer, { marginBottom: 14 }]}>
        <SkeletonLine width={130} height={16} style={{ marginBottom: 12 }} />
        <View style={styles.grid2x2}>
          {[1, 2, 3, 4].map(idx => (
            <View key={idx} style={styles.metricCardSkeleton}>
              <View style={[styles.row, { gap: 6 }]}>
                <SkeletonCircle size={18} />
                <SkeletonLine width={65} height={12} />
              </View>
              <SkeletonLine width={40} height={24} style={{ marginTop: 8 }} />
              <SkeletonLine width={75} height={10} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>

        {/* Reserved Stock Banner Skeleton */}
        <SkeletonBox width="100%" height={46} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      {/* Filter Tabs Skeleton */}
      <View style={[styles.row, { gap: 8, marginBottom: 14 }]}>
        {[65, 80, 85, 75].map((w, idx) => (
          <SkeletonBox key={idx} width={w} height={32} borderRadius={8} />
        ))}
      </View>

      {/* Inventory Item Cards */}
      <View style={{ gap: 14 }}>
        {[1, 2].map(idx => (
          <View key={idx} style={styles.cardContainer}>
            <View style={[styles.row, { gap: 12 }]}>
              <SkeletonBox width={52} height={60} borderRadius={10} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonLine width="75%" height={14} />
                <SkeletonLine width="40%" height={11} />
                <SkeletonLine width="50%" height={12} />
              </View>
              <SkeletonBox width={65} height={24} borderRadius={12} />
            </View>

            {/* Variants rows placeholder */}
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8 }}>
              <SkeletonLine width={110} height={12} />
              <SkeletonBox width="100%" height={68} borderRadius={12} />
              <SkeletonBox width="100%" height={68} borderRadius={12} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// 4. Analytics Skeleton
// -----------------------------------------------------------
export function AnalyticsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Outfit Selector Pill */}
      <SkeletonBox width="100%" height={44} borderRadius={12} style={{ marginBottom: 14 }} />

      {/* 2x2 Metric Cards */}
      <View style={[styles.grid2x2, { marginBottom: 14 }]}>
        {[1, 2, 3, 4].map(idx => (
          <View key={idx} style={styles.metricCardSkeleton}>
            <SkeletonCircle size={24} />
            <SkeletonLine width={55} height={26} style={{ marginTop: 10 }} />
            <SkeletonLine width={80} height={11} style={{ marginTop: 5 }} />
          </View>
        ))}
      </View>

      {/* Trend Chart Box Skeleton */}
      <View style={[styles.cardContainer, { marginBottom: 14 }]}>
        <View style={styles.rowBetween}>
          <SkeletonLine width={140} height={16} />
          <SkeletonBox width={70} height={24} borderRadius={12} />
        </View>
        <SkeletonBox width="100%" height={140} borderRadius={12} style={{ marginTop: 16 }} />
      </View>

      {/* Sizing Distribution Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLine width={130} height={15} style={{ marginBottom: 12 }} />
        <View style={{ gap: 8 }}>
          {[1, 2, 3, 4, 5].map(idx => (
            <SkeletonBox key={idx} width="100%" height={24} borderRadius={6} />
          ))}
        </View>
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// 5. Invoices Skeleton
// -----------------------------------------------------------
export function InvoiceSkeleton() {
  return (
    <View style={styles.container}>
      {/* Client Selector & Date */}
      <View style={[styles.cardContainer, { marginBottom: 14 }]}>
        <SkeletonLine width={120} height={14} style={{ marginBottom: 10 }} />
        <SkeletonBox width="100%" height={40} borderRadius={10} style={{ marginBottom: 10 }} />
        <View style={styles.rowBetween}>
          <SkeletonLine width={90} height={12} />
          <SkeletonBox width={100} height={24} borderRadius={6} />
        </View>
      </View>

      {/* Product Selection Skeleton */}
      <View style={[styles.cardContainer, { marginBottom: 14 }]}>
        <SkeletonLine width={140} height={14} style={{ marginBottom: 10 }} />
        <SkeletonBox width="100%" height={40} borderRadius={10} style={{ marginBottom: 12 }} />
        <View style={{ gap: 8 }}>
          {[1, 2].map(idx => (
            <View key={idx} style={[styles.rowBetween, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }]}>
              <View style={{ gap: 4 }}>
                <SkeletonLine width={120} height={13} />
                <SkeletonLine width={70} height={11} />
              </View>
              <SkeletonBox width={60} height={24} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>

      {/* Summary Total Box */}
      <View style={styles.cardContainer}>
        <View style={styles.rowBetween}>
          <SkeletonLine width={80} height={14} />
          <SkeletonLine width={90} height={22} />
        </View>
        <SkeletonBox width="100%" height={46} borderRadius={10} style={{ marginTop: 14 }} />
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// 6. Reviews Skeleton
// -----------------------------------------------------------
export function ReviewsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search and Action Bar */}
      <View style={[styles.rowBetween, { marginBottom: 14 }]}>
        <SkeletonBox width="70%" height={40} borderRadius={10} />
        <SkeletonBox width="26%" height={40} borderRadius={10} />
      </View>

      {/* Review Cards */}
      <View style={{ gap: 12 }}>
        {[1, 2, 3].map(idx => (
          <View key={idx} style={styles.cardContainer}>
            <View style={styles.rowBetween}>
              <View style={[styles.row, { gap: 10 }]}>
                <SkeletonCircle size={38} />
                <View style={{ gap: 4 }}>
                  <SkeletonLine width={100} height={14} />
                  <SkeletonLine width={60} height={10} />
                </View>
              </View>
              <SkeletonBox width={65} height={16} borderRadius={4} />
            </View>
            <SkeletonLine width="95%" height={12} style={{ marginTop: 12 }} />
            <SkeletonLine width="75%" height={12} style={{ marginTop: 6 }} />
            <View style={[styles.rowBetween, { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
              <SkeletonBox width={70} height={22} borderRadius={6} />
              <SkeletonCircle size={24} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    overflow: 'hidden',
  },
  lightBase: {
    backgroundColor: '#e2e8f0',
  },
  darkBase: {
    backgroundColor: '#27272a',
  },
  container: {
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCardSkeleton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  inquiryItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});
