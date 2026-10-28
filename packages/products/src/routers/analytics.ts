import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getOverallAnalytics,
  getProductAnalytics,
  getAnalyticsOverview,
  getAllProductsAnalytics,
  trackAnalyticsEvent,
  getViewsAnalytics,
  getClicksAnalytics,
  getConversionAnalytics,
  getFunnelAnalytics,
  getChannelRatioAnalytics,
  getGrowthPulseAnalytics,
  getPaymentModesAnalytics,
  getDemandHighlightsAnalytics,
  getCatalogueTelemetryAnalytics,
  getInventorySummaryAnalytics,
} from '../analytics.js';

export const analyticsRouter = router({
  getOverview: publicProcedure
    .meta({ description: 'Get analytics overview for overall store or specific product' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getAnalyticsOverview(input || undefined);
    }),

  getOverall: publicProcedure
    .meta({ description: 'Get overall store views, clicks, and conversion rates' })
    .query(async () => {
      return await getOverallAnalytics();
    }),

  getProduct: publicProcedure
    .meta({ description: 'Get individual product views, clicks, and conversion rates' })
    .input(
      z.object({
        slug: z.string().nullish(),
        productId: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      return await getProductAnalytics(input);
    }),

  getAllProducts: adminProcedure
    .meta({ description: 'Get analytics breakdown across all products (Admin only)' })
    .query(async () => {
      return await getAllProductsAnalytics();
    }),

  getViews: publicProcedure
    .meta({ description: 'Get views telemetry for store or specific product' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getViewsAnalytics(input || undefined);
    }),

  getClicks: publicProcedure
    .meta({ description: 'Get click events telemetry (WhatsApp, Instagram, Total)' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getClicksAnalytics(input || undefined);
    }),

  getConversion: publicProcedure
    .meta({ description: 'Get conversion rates (inquiries, orders, online orders)' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getConversionAnalytics(input || undefined);
    }),

  getFunnel: publicProcedure
    .meta({ description: 'Get conversion funnel focusing specifically on online orders' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getFunnelAnalytics(input || undefined);
    }),

  getChannelRatio: publicProcedure
    .meta({ description: 'Get online vs offline order ratio breakdown' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getChannelRatioAnalytics(input || undefined);
    }),

  getGrowthPulse: publicProcedure
    .meta({ description: 'Get 30-day velocity and growth pulse for total, online, and walk-in' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getGrowthPulseAnalytics(input || undefined);
    }),

  getPaymentModes: publicProcedure
    .meta({ description: 'Get customer payment methods breakdown (Online, Cash, Credit/Khata)' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaymentModesAnalytics(input || undefined);
    }),

  getDemandHighlights: adminProcedure
    .meta({ description: 'Get outfit demand highlights (most viewed, demanded, top converting)' })
    .query(async () => {
      return await getDemandHighlightsAnalytics();
    }),

  getCatalogueTelemetry: adminProcedure
    .meta({ description: 'Get detailed catalogue telemetry across products' })
    .query(async () => {
      return await getCatalogueTelemetryAnalytics();
    }),

  getInventorySummary: publicProcedure
    .meta({ description: 'Get real-time inventory health and stock summary' })
    .query(async () => {
      return await getInventorySummaryAnalytics();
    }),

  track: publicProcedure
    .meta({ description: 'Track view, WhatsApp click, or Instagram click events' })
    .input(
      z.object({
        type: z.enum(['view', 'whatsapp', 'instagram']),
        productId: z.string().nullish(),
        slug: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      return await trackAnalyticsEvent(input);
    }),
});
