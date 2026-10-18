export const colors = {
  primary: {
    DEFAULT: '#FF5E36',
    hover: '#e04d27',
    light: '#fff0ed',
    border: '#ffd6cc',
    secondary: '#FF8A65',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  status: {
    success: {
      DEFAULT: '#10b981',
      dark: '#059669',
      light: '#ecfdf5',
      border: '#a7f3d0',
    },
    danger: {
      DEFAULT: '#ef4444',
      dark: '#dc2626',
      light: '#fef2f2',
      border: '#fecaca',
    },
    warning: {
      DEFAULT: '#f59e0b',
      dark: '#d97706',
      light: '#fffbeb',
      border: '#fde68a',
    },
    info: {
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
      light: '#eff6ff',
      border: '#bfdbfe',
    },
  },
  background: {
    app: '#fafafa',
    surface: '#ffffff',
    subtle: '#f4f4f5',
    muted: '#f8fafc',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  border: {
    subtle: '#f4f4f5',
    DEFAULT: '#e4e4e7',
    strong: '#d4d4d8',
    focus: '#09090b',
  },
  text: {
    primary: '#09090b',
    secondary: '#52525b',
    muted: '#71717a',
    placeholder: '#a1a1aa',
    inverse: '#ffffff',
    brand: '#FF5E36',
  },
} as const;

export type ThemeColors = typeof colors;
