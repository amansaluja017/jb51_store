import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import { getSiteConfig, updateSiteConfig, triggerWebRevalidation } from '../site-config.js';

const heroSlideSchema = z.object({
  image: z.string().min(1),
  tagline: z.string().default(''),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  badgeProduct: z
    .object({
      name: z.string(),
      price: z.number(),
      img: z.string(),
      slug: z.string(),
    })
    .optional(),
});

const adBannerSchema = z.object({
  tagline: z.string().default(''),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  buttonText: z.string().default('Book Appointment'),
  buttonLink: z.string().default('/support'),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  imageUrl: z.string().default('/assets/luxury_ad_banner.png'),
});

const saleSectionSchema = z.object({
  enabled: z.boolean().default(true),
  tagline: z.string().default('LIMITED TIME PROMO'),
  title: z.string().default('Summer Season Flash Sale'),
  subtitle: z.string().default(''),
  discountPercentage: z.number().optional(),
  hoursLeft: z.number().optional(),
  minutesLeft: z.number().optional(),
  secondsLeft: z.number().optional(),
  endTime: z.string().optional(),
  buttonText: z.string().default('Shop Flash Sale'),
  buttonLink: z.string().default('/shop?filter=sale'),
  bannerImageUrl: z.string().optional(),
});

const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const contactInfoSchema = z.object({
  phoneNumber: z.string().default(''),
  whatsappNumber: z.string().default(''),
  email: z.string().default(''),
  address: z.string().default(''),
  instagramUrl: z.string().optional(),
});

export const siteConfigRouter = router({
  get: publicProcedure
    .meta({ description: 'Get dynamic site configuration and web UI content' })
    .query(async () => {
      return await getSiteConfig();
    }),

  update: adminProcedure
    .meta({ description: 'Update web UI configuration and trigger revalidation (Admin only)' })
    .input(
      z.object({
        promotionalHeader: z.array(z.string()).optional(),
        heroSlides: z.array(heroSlideSchema).optional(),
        adBanner: adBannerSchema.optional(),
        saleSection: saleSectionSchema.optional(),
        faqs: z.array(faqItemSchema).optional(),
        contactInfo: contactInfoSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateSiteConfig({
        ...input,
        updatedBy: ctx.user?.email || ctx.user?.userName || 'admin',
      });
    }),

  revalidate: adminProcedure
    .meta({ description: 'Trigger Next.js cache revalidation for the web application' })
    .input(
      z
        .object({
          tag: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }) => {
      const tag = input?.tag || 'site-config';
      await triggerWebRevalidation(tag);
      return { success: true, revalidated: true, tag, timestamp: new Date().toISOString() };
    }),
});
