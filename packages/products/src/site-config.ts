import { db } from '@repo/db/client';
import {
  siteConfigTable,
  SiteConfigData,
  HeroSlideItem,
  AdBannerConfig,
  SaleSectionConfig,
  FaqItem,
  ContactInfoConfig,
} from '@repo/db/schema';
import { eq, sql } from 'drizzle-orm';

export type {
  SiteConfigData,
  HeroSlideItem,
  AdBannerConfig,
  SaleSectionConfig,
  FaqItem,
  ContactInfoConfig,
};

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  promotionalHeader: [
    'Summer Sale: Up to 70% Off',
    'Complimentary shipping on orders above ₹15,000',
    'Bespoke customization available at our store',
  ],
  heroSlides: [
    {
      image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=2000&q=90',
      tagline: 'NEW COLLECTION',
      title: 'Elevate Your Everyday Style',
      subtitle: 'Discover timeless silhouettes crafted for comfort, designed for elegance.',
      badgeProduct: {
        name: 'Ivory Chanderi Co-ord',
        price: 16800,
        img: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=150&h=150&q=80',
        slug: 'ivory-chanderi-silk-coord',
      },
    },
    {
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
      tagline: 'THE FESTIVE EDIT',
      title: 'Heritage Indian Silhouettes',
      subtitle: 'Meticulously crafted traditional ensembles, updated for modern celebrations.',
      badgeProduct: {
        name: 'Crimson Velvet Zardozi',
        price: 32000,
        img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&h=150&q=80',
        slug: 'crimson-velvet-zardozi-suit',
      },
    },
    {
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90',
      tagline: 'HANDCRAFTED LUXURY',
      title: 'Rooted in Heritage Craft',
      subtitle: 'Pure textiles, organic colors, and hand-woven stories from across India.',
      badgeProduct: {
        name: 'Emerald Banarasi Suit',
        price: 24500,
        img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&h=150&q=80',
        slug: 'emerald-banarasi-suit',
      },
    },
  ],
  adBanner: {
    tagline: 'BESPOKE SERVICE',
    title: 'The Art of Custom Drape',
    subtitle: 'Experience the pinnacle of bespoke couture. Our master craftsmen tailor each ensemble to your exact measurements, ensuring a silhouette that flows with effortless grace and timeless sophistication.',
    buttonText: 'Book Appointment',
    buttonLink: '/support',
    secondaryButtonText: 'Explore Collection',
    secondaryButtonLink: '/shop',
    imageUrl: '/assets/luxury_ad_banner.png',
  },
  saleSection: {
    enabled: true,
    tagline: 'LIMITED TIME PROMO',
    title: 'Summer Season Flash Sale',
    subtitle: 'Enjoy up to 70% off on selected traditional designs and ready-to-wear silk co-ords. Offer expires shortly.',
    discountPercentage: 70,
    hoursLeft: 14,
    minutesLeft: 45,
    secondsLeft: 30,
    endTime: new Date(Date.now() + (14 * 3600 + 45 * 60 + 30) * 1000).toISOString(),
    buttonText: 'Shop Flash Sale',
    buttonLink: '/shop?filter=sale',
    bannerImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=80',
  },
  faqs: [
    {
      q: 'How do I order a custom-fit suit?',
      a: 'Select your desired garment and size. During standard checkout, you can input custom measurements. Additionally, our concierge team actively contacts all bespoke orders via email or WhatsApp to confirm your proportions.',
    },
    {
      q: 'What is the typical timeline for bespoke tailoring?',
      a: 'Each custom suit is handcrafted by our master designers. Tailoring requires 2 to 3 weeks from measurement confirmation to shipment. Ready-to-wear lines are dispatched within 2–3 business days.',
    },
    {
      q: 'Do you offer international shipping?',
      a: 'Yes, we ship globally. Express transit usually takes 5–7 business days depending on location. Full tracking credentials will be provided upon dispatch.',
    },
    {
      q: 'Can I request custom modifications to designs?',
      a: 'Absolutely. Since each outfit is individually finalized, you can request custom sleeve lengths, necklines, colors, or fabrics. Simply reach out immediately after booking.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'Ready-to-wear items can be exchanged within 7 days of delivery. Because customized garments are created strictly to your specifications, they are non-refundable, but we offer free tailoring adjustments if needed.',
    },
  ],
  contactInfo: {
    phoneNumber: '+91 98765 43210',
    whatsappNumber: '919876543210',
    email: 'concierge@jb51.com',
    address: 'Model Town, Ludhiana, Punjab 141002, India',
    instagramUrl: 'https://instagram.com/jb51_clothing_house',
  },
};

let tableCreated = false;
async function ensureSiteConfigTable() {
  if (tableCreated) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_config (
        id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
        promotional_header JSONB,
        hero_slides JSONB,
        ad_banner JSONB,
        sale_section JSONB,
        faqs JSONB,
        contact_info JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by VARCHAR(128)
      );
    `);
    tableCreated = true;
  } catch (err) {
    console.warn('[ensureSiteConfigTable Notice]:', err);
  }
}

export async function getSiteConfig(): Promise<SiteConfigData & { updatedAt?: Date | null; updatedBy?: string | null }> {
  await ensureSiteConfigTable();

  try {
    const [row] = await db
      .select()
      .from(siteConfigTable)
      .where(eq(siteConfigTable.id, 'default'));

    if (!row) {
      // Seed default config into DB
      await db.insert(siteConfigTable).values({
        id: 'default',
        promotionalHeader: DEFAULT_SITE_CONFIG.promotionalHeader,
        heroSlides: DEFAULT_SITE_CONFIG.heroSlides,
        adBanner: DEFAULT_SITE_CONFIG.adBanner,
        saleSection: DEFAULT_SITE_CONFIG.saleSection,
        faqs: DEFAULT_SITE_CONFIG.faqs,
        contactInfo: DEFAULT_SITE_CONFIG.contactInfo,
        updatedBy: 'system',
      });
      return DEFAULT_SITE_CONFIG;
    }

    return {
      promotionalHeader: row.promotionalHeader || DEFAULT_SITE_CONFIG.promotionalHeader,
      heroSlides: row.heroSlides || DEFAULT_SITE_CONFIG.heroSlides,
      adBanner: row.adBanner || DEFAULT_SITE_CONFIG.adBanner,
      saleSection: row.saleSection || DEFAULT_SITE_CONFIG.saleSection,
      faqs: row.faqs || DEFAULT_SITE_CONFIG.faqs,
      contactInfo: row.contactInfo || DEFAULT_SITE_CONFIG.contactInfo,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    };
  } catch (err) {
    console.error('[getSiteConfig Error]:', err);
    return DEFAULT_SITE_CONFIG;
  }
}

export interface UpdateSiteConfigInput {
  promotionalHeader?: string[];
  heroSlides?: HeroSlideItem[];
  adBanner?: AdBannerConfig;
  saleSection?: SaleSectionConfig;
  faqs?: FaqItem[];
  contactInfo?: ContactInfoConfig;
  updatedBy?: string | null;
}

export async function updateSiteConfig(input: UpdateSiteConfigInput) {
  await ensureSiteConfigTable();

  const current = await getSiteConfig();

  const updateValues: Record<string, any> = {
    updatedAt: new Date(),
    updatedBy: input.updatedBy || 'admin',
  };

  if (input.promotionalHeader !== undefined) updateValues.promotionalHeader = input.promotionalHeader;
  if (input.heroSlides !== undefined) updateValues.heroSlides = input.heroSlides;
  if (input.adBanner !== undefined) updateValues.adBanner = input.adBanner;
  if (input.saleSection !== undefined) updateValues.saleSection = input.saleSection;
  if (input.faqs !== undefined) updateValues.faqs = input.faqs;
  if (input.contactInfo !== undefined) updateValues.contactInfo = input.contactInfo;

  await db
    .insert(siteConfigTable)
    .values({
      id: 'default',
      promotionalHeader: input.promotionalHeader || current.promotionalHeader,
      heroSlides: input.heroSlides || current.heroSlides,
      adBanner: input.adBanner || current.adBanner,
      saleSection: input.saleSection || current.saleSection,
      faqs: input.faqs || current.faqs,
      contactInfo: input.contactInfo || current.contactInfo,
      updatedBy: input.updatedBy || 'admin',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteConfigTable.id,
      set: updateValues,
    });

  // Trigger cache invalidation in Next.js web application
  triggerWebRevalidation().catch((e) => {
    console.warn('[triggerWebRevalidation Warning]:', e?.message || e);
  });

  return await getSiteConfig();
}

/**
 * Triggers revalidation in the Next.js web app for the 'site-config' tag
 */
export async function triggerWebRevalidation(tag = 'site-config') {
  const webUrl = process.env.WEB_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${webUrl}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`[triggerWebRevalidation] Revalidation returned status ${res.status}`);
    }
  } catch (err: any) {
    // If web is not reachable during test or development, log and proceed
    console.log(`[triggerWebRevalidation] Notice: Web revalidation ping skipped (${err.message})`);
  }
}
