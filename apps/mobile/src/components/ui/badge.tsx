import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'amber'
  | 'blue';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'default',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const variantBadgeStyle = variantStyles[variant] || variantStyles.default;
  const variantTextStyle = textStyles[variant] || textStyles.default;

  const renderContent = () => {
    if (children === null || children === undefined || typeof children === 'boolean') {
      return null;
    }
    if (React.isValidElement(children)) {
      return children;
    }
    return (
      <Text style={[styles.badgeText, variantTextStyle, textStyle]}>
        {children}
      </Text>
    );
  };

  return (
    <View style={[styles.badge, variantBadgeStyle, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  iconContainer: {
    marginRight: 4,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: '#18181b',
    borderColor: '#18181b',
  },
  secondary: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  destructive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#e4e4e7',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  amber: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  blue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
});

const textStyles = StyleSheet.create({
  default: {
    color: '#ffffff',
  },
  secondary: {
    color: '#3f3f46',
  },
  destructive: {
    color: '#dc2626',
  },
  outline: {
    color: '#09090b',
  },
  success: {
    color: '#16a34a',
  },
  amber: {
    color: '#d97706',
  },
  blue: {
    color: '#2563eb',
  },
});
