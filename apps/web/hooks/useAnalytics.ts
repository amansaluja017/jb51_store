'use client';

import { useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc/client/react';

export interface TrackEventParams {
  type: 'view' | 'whatsapp' | 'instagram';
  productId?: string | null;
  slug?: string | null;
}

export function useAnalytics() {
  const trackMutation = api.analytics.track.useMutation();
  const mutateRef = useRef(trackMutation.mutate);

  useEffect(() => {
    mutateRef.current = trackMutation.mutate;
  }, [trackMutation.mutate]);

  const trackEvent = useCallback((params: TrackEventParams) => {
    try {
      mutateRef.current({
        type: params.type,
        productId: params.productId || undefined,
        slug: params.slug || undefined,
      });
    } catch (err) {
      console.warn('[Analytics Telemetry Warning]:', err);
    }
  }, []);

  return {
    trackEvent,
    isTracking: trackMutation.isPending,
  };
}
