import { useWindowDimensions, Platform } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallPhone: boolean;  // < 380px (iPhone SE, small Androids)
  isPhone: boolean;       // < 768px
  isTablet: boolean;      // 768px - 1023px
  isDesktop: boolean;     // >= 1024px
  isWideScreen: boolean;  // >= 768px (tablets & desktop/web)
  isLandscape: boolean;
  contentMaxWidth: number;
  containerPadding: number;
  modalMaxWidth: number;
  /**
   * Helper to pick a value depending on current breakpoint
   */
  select: <T>(values: {
    smallPhone?: T;
    phone: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
  }) => T;
  /**
   * Returns responsive width for grid items accounting for gaps and container padding
   */
  getGridItemWidth: (columns: number, gap?: number, maxContainerWidth?: number) => number;
}

export const BREAKPOINTS = {
  smallPhone: 380,
  phone: 768,
  tablet: 1024,
} as const;

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < BREAKPOINTS.smallPhone;
  const isPhone = width < BREAKPOINTS.phone;
  const isTablet = width >= BREAKPOINTS.phone && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isWideScreen = width >= BREAKPOINTS.phone;
  const isLandscape = width > height;

  const contentMaxWidth = isDesktop ? 1080 : isTablet ? 840 : width;
  const containerPadding = isSmallPhone ? 12 : isWideScreen ? 24 : 16;
  const modalMaxWidth = isDesktop ? 680 : isTablet ? 600 : Math.min(width * 0.94, 520);

  const select = <T>(values: {
    smallPhone?: T;
    phone: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
  }): T => {
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    if (isWideScreen && values.wide !== undefined) return values.wide;
    if (isSmallPhone && values.smallPhone !== undefined) return values.smallPhone;
    return values.phone;
  };

  const getGridItemWidth = (columns: number, gap = 12, maxContainerWidth?: number): number => {
    const effectiveWidth = maxContainerWidth ? Math.min(width, maxContainerWidth) : width;
    const totalPadding = containerPadding * 2;
    const totalGaps = gap * (columns - 1);
    const availableWidth = effectiveWidth - totalPadding - totalGaps;
    return Math.floor(availableWidth / columns);
  };

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    isWideScreen,
    isLandscape,
    contentMaxWidth,
    containerPadding,
    modalMaxWidth,
    select,
    getGridItemWidth,
  };
}

export default useResponsive;

