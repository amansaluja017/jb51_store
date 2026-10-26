'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

// Global session set to prevent duplicate route impression hits
const sessionTrackedPaths = new Set<string>();

export function StoreAnalyticsTracker() {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Avoid double-counting product detail pages (which track product-specific telemetry)
    if (pathname.startsWith('/product/')) {
      return;
    }

    // Only fire if the path actually changed and hasn't been tracked this session
    if (lastPathname.current !== pathname && !sessionTrackedPaths.has(pathname)) {
      lastPathname.current = pathname;
      sessionTrackedPaths.add(pathname);
      trackEvent({ type: 'view' });
    }
  }, [pathname, trackEvent]);

  return null;
}
