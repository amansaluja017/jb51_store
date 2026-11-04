'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { SiteConfigData, ContactInfoConfig } from '@/lib/site-config';

export interface FormattedContactInfo extends ContactInfoConfig {
  /**
   * Only digits (e.g. "919306234357") suitable for https://wa.me/{cleanWhatsApp}
   */
  cleanWhatsApp: string;
  /**
   * Phone number formatted for tel: links (e.g. "+919306234357")
   */
  cleanPhone: string;
  /**
   * Extracted Instagram handle without @ or URL prefixes (e.g. "jb51_clothing_house")
   */
  instagramHandle: string;
  /**
   * Complete verified Instagram profile URL (e.g. "https://instagram.com/jb51_clothing_house")
   */
  instaLink: string;
  /**
   * Generates a direct WhatsApp chat URL with optional prefilled message
   */
  waLink: (message?: string) => string;
  /**
   * Direct tel: link for phone dialers
   */
  telLink: string;
  /**
   * Direct mailto: link with optional prefilled subject line
   */
  mailtoLink: (subject?: string) => string;
}

export function formatContactInfo(raw?: Partial<ContactInfoConfig>): FormattedContactInfo {
  const phoneNumber = raw?.phoneNumber?.trim() || '+91 93062 34357';
  const whatsappNumber = raw?.whatsappNumber?.trim() || '919306234357';
  const email = raw?.email?.trim() || 'support@jb51.shop';
  const address = raw?.address?.trim() || 'Model Town, Kaithal, Haryana 136027, India';
  const instagramUrl = raw?.instagramUrl?.trim() || 'https://instagram.com/jb51_clothing_house';

  // Extract clean digits for WhatsApp
  const cleanWhatsApp = whatsappNumber.replace(/\D/g, '') || '919306234357';

  // Extract dialable phone for tel:
  const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '') || `+${cleanWhatsApp}`;

  // Extract Instagram handle
  let instagramHandle = instagramUrl;
  try {
    if (instagramUrl.includes('instagram.com/')) {
      const match = instagramUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1]) {
        instagramHandle = match[1];
      }
    } else {
      instagramHandle = instagramUrl.replace(/^@/, '').replace(/\/$/, '');
    }
  } catch {
    instagramHandle = 'jb51_clothing_house';
  }

  const instaLink = instagramUrl.startsWith('http')
    ? instagramUrl
    : `https://instagram.com/${instagramHandle}`;

  const waLink = (message?: string): string => {
    if (message && message.trim()) {
      return `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
    }
    return `https://wa.me/${cleanWhatsApp}`;
  };

  const telLink = `tel:${cleanPhone}`;

  const mailtoLink = (subject?: string): string => {
    if (subject && subject.trim()) {
      return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
    return `mailto:${email}`;
  };

  return {
    phoneNumber,
    whatsappNumber,
    email,
    address,
    instagramUrl,
    cleanWhatsApp,
    cleanPhone,
    instagramHandle,
    instaLink,
    waLink,
    telLink,
    mailtoLink,
  };
}

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
