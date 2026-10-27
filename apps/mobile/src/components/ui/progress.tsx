import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

export interface ProgressProps {
  value: number; // 0 to 100
  height?: number;
  indicatorColor?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Progress({
  value,
  height = 8,
  indicatorColor = '#2563eb',
  trackColor = '#f4f4f5',
  style,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            width: `${clamped}%`,
            height,
            backgroundColor: indicatorColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
  },
});
