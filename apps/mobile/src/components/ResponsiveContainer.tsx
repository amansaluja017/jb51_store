import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
  usePadding?: boolean;
}

/**
 * Standard container that gracefully constrains width on tablets and desktop web,
 * and maintains full-width fluidity on mobile phones.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth,
  usePadding = false,
}) => {
  const { isWideScreen, contentMaxWidth, containerPadding } = useResponsive();

  const maxW = maxWidth ?? contentMaxWidth;

  return (
    <View
      style={[
        styles.outer,
        isWideScreen && styles.wideOuter,
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          isWideScreen && { maxWidth: maxW, alignSelf: 'center', width: '100%' },
          usePadding && { paddingHorizontal: containerPadding },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    flex: 1,
  },
  wideOuter: {
    alignItems: 'center',
    width: '100%',
  },
  inner: {
    width: '100%',
    flex: 1,
  },
});

export default ResponsiveContainer;

