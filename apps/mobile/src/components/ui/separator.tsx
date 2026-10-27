import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export function Separator({
  orientation = 'horizontal',
  style,
  color = '#e4e4e7',
}: SeparatorProps) {
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
