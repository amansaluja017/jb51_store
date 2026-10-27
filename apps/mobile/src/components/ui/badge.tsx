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

export type BadgeSize = 'default' | 'sm' | 'lg' | 'icon';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const variantBadgeStyle = variantStyles[variant] || variantStyles.default;
  const variantTextStyle = textStyles[variant] || textStyles.default;
  const sizeBadgeStyle = sizeBadgeStyles[size] || sizeBadgeStyles.default;
  const sizeTextStyle = sizeTextStyles[size] || sizeTextStyles.default;

  const hasChildren =
    children !== null && children !== undefined && typeof children !== 'boolean';

  const renderContent = () => {
    if (!hasChildren) {
      return null;
    }
    if (React.isValidElement(children)) {
      return children;
    }
    return (
      <Text style={[styles.badgeText, variantTextStyle, sizeTextStyle, textStyle]}>
        {children}
      </Text>
    );
  };

  return (
    <View style={[styles.badge, variantBadgeStyle, sizeBadgeStyle, style]}>
      {icon ? (
        <View
          style={
            hasChildren
              ? size === 'sm'
                ? styles.iconContainerSm
                : styles.iconContainer
              : styles.iconContainerSolo
          }
        >
          {icon}
        </View>
      ) : null}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  iconContainer: {
    marginRight: 4,
  },
  iconContainerSm: {
    marginRight: 2.5,
  },
  iconContainerSolo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const sizeBadgeStyles = StyleSheet.create({
  default: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  sm: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  lg: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  icon: {
    width: 22,
    height: 22,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const sizeTextStyles = StyleSheet.create({
  default: {
    fontSize: 11,
  },
  sm: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  lg: {
    fontSize: 12,
  },
  icon: {
    fontSize: 10,
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
