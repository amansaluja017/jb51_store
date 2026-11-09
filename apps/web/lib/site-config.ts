import { unstable_cache } from 'next/cache';
import {
  getSiteConfig,
  DEFAULT_SITE_CONFIG,
  type SiteConfigData,
  type MaintenanceModeConfig,
  type HeroSlideItem,
  type AdBannerConfig,
  type SaleSectionConfig,
  type FaqItem,
  type ContactInfoConfig,
} from '@repo/products';

export type {
  SiteConfigData,
  MaintenanceModeConfig,
  HeroSlideItem,
  AdBannerConfig,
  SaleSectionConfig,
  FaqItem,
  ContactInfoConfig,
};

export const getCachedSiteConfig = unstable_cache(
  async (): Promise<SiteConfigData> => {
    try {
      const data = await getSiteConfig();
      return {
        maintenanceMode: data.maintenanceMode || DEFAULT_SITE_CONFIG.maintenanceMode,
        promotionalHeaderEnabled:
          data.promotionalHeaderEnabled !== undefined ? data.promotionalHeaderEnabled : true,
        promotionalHeader: data.promotionalHeader || DEFAULT_SITE_CONFIG.promotionalHeader,
        heroSlides: data.heroSlides || DEFAULT_SITE_CONFIG.heroSlides,
        adBanner: data.adBanner || DEFAULT_SITE_CONFIG.adBanner,
        secondAdBanner: data.secondAdBanner || DEFAULT_SITE_CONFIG.secondAdBanner,
        saleSection: data.saleSection || DEFAULT_SITE_CONFIG.saleSection,
        faqs: data.faqs || DEFAULT_SITE_CONFIG.faqs,
        contactInfo: data.contactInfo || DEFAULT_SITE_CONFIG.contactInfo,
      };
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  },
  ['site-config-cache-key'],
  {
    tags: ['site-config'],
    revalidate: 86400, // 24 hours, invalidation handled via revalidateTag('site-config')
  }
);
