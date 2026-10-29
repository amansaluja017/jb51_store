import { pgTable, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export interface HeroSlideItem {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  badgeProduct?: {
    name: string;
    price: number;
    img: string;
    slug: string;
  };
}

export interface AdBannerConfig {
  tagline: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl: string;
}

export interface SaleSectionConfig {
  enabled: boolean;
  tagline: string;
  title: string;
  subtitle: string;
  discountPercentage?: number;
  hoursLeft?: number;
  minutesLeft?: number;
  secondsLeft?: number;
  endTime?: string;
  buttonText?: string;
  buttonLink?: string;
  bannerImageUrl?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ContactInfoConfig {
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  instagramUrl?: string;
}

export interface SiteConfigData {
  promotionalHeader: string[];
  heroSlides: HeroSlideItem[];
  adBanner: AdBannerConfig;
  saleSection: SaleSectionConfig;
  faqs: FaqItem[];
  contactInfo: ContactInfoConfig;
}

export const siteConfigTable = pgTable('site_config', {
  id: varchar('id', { length: 64 }).primaryKey().default('default'),
  promotionalHeader: jsonb('promotional_header').$type<string[]>(),
  heroSlides: jsonb('hero_slides').$type<HeroSlideItem[]>(),
  adBanner: jsonb('ad_banner').$type<AdBannerConfig>(),
  saleSection: jsonb('sale_section').$type<SaleSectionConfig>(),
  faqs: jsonb('faqs').$type<FaqItem[]>(),
  contactInfo: jsonb('contact_info').$type<ContactInfoConfig>(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  updatedBy: varchar('updated_by', { length: 128 }),
});

export type SiteConfigRow = typeof siteConfigTable.$inferSelect;
export type NewSiteConfigRow = typeof siteConfigTable.$inferInsert;
