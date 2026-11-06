import { TabType } from '../components/NavigationTabBar';

export const ROUTE_TAB_MAP: Record<string, TabType> = {
  '/': 'dashboard',
  '/products-catalog': 'catalogue',
  '/stock': 'inventory',
  '/invoices': 'invoices',
  '/reviews': 'reviews',
};

export const TAB_ROUTE_MAP: Record<TabType, string> = {
  dashboard: '/',
  analytics: '/',
  catalogue: '/products-catalog',
  inventory: '/stock',
  invoices: '/invoices',
  reviews: '/reviews',
};

/**
 * Returns the canonical TabType corresponding to a route pathname.
 */
export function getTabFromPathname(pathname: string): TabType {
  return ROUTE_TAB_MAP[pathname] || 'dashboard';
}

