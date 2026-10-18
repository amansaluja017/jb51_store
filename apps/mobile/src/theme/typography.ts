import { Platform } from 'react-native';

export const typography = {
  fontFamily: {
    serif: Platform.OS === 'ios' ? 'Didot' : 'serif',
    sans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fontSize: {
    xxs: 9,
    xs: 11,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
} as const;

export type Typography = typeof typography;
