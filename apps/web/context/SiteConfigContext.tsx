'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { SiteConfigData } from '@/lib/site-config';

// Re-export from the shared, server-safe utility so external imports still work.
export type { FormattedContactInfo } from '@/lib/contact-info';
export { formatContactInfo } from '@/lib/contact-info';
import type { FormattedContactInfo } from '@/lib/contact-info';
import { formatContactInfo } from '@/lib/contact-info';

interface SiteConfigContextType {
  siteConfig: SiteConfigData;
  contactInfo: FormattedContactInfo;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export function SiteConfigProvider({
  children,
  siteConfig,
}: {
  children: React.ReactNode;
  siteConfig: SiteConfigData;
}) {
  const contactInfo = useMemo(() => {
    return formatContactInfo(siteConfig.contactInfo);
  }, [siteConfig.contactInfo]);

  const value = useMemo(() => ({
    siteConfig,
    contactInfo,
  }), [siteConfig, contactInfo]);

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

/**
 * Access the active storefront configuration (hero slides, banners, FAQs, contact info).
 */
export function useSiteConfig(): SiteConfigData {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return ctx.siteConfig;
}

/**
 * Access active contact information configured by the admin from the mobile app
 * (phone number, WhatsApp number, email, Instagram URL, and store address).
 */
export function useContactInfo(): FormattedContactInfo {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    // Return fallback format if invoked outside provider
    return formatContactInfo();
  }
  return ctx.contactInfo;
}
