import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getOverallAnalytics,
  getProductAnalytics,
  getAnalyticsOverview,
  getDashboardOverviewAnalytics,
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
  getPaginatedCatalogueTelemetryAnalytics,
  getInventorySummaryAnalytics,
} from '../analytics.js';

export const analyticsRouter = router({
  getOverview: adminProcedure
    .meta({ description: 'Get consolidated analytics overview using p-limit (concurrency: 3) and Promise.allSettled (Admin only)' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getDashboardOverviewAnalytics(input || undefined);
    }),

  getDashboardOverview: adminProcedure
    .meta({ description: 'Batch fetch all overview telemetry with concurrency limit of 3 using p-limit and Promise.allSettled (Admin only)' })
    .input(
      z
        .object({
          slug: z.string().nullish(),
          productId: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getDashboardOverviewAnalytics(input || undefined);
    }),

  getOverall: adminProcedure
    .meta({ description: 'Get overall store views, clicks, and conversion rates (Admin only)' })
    .query(async () => {
      return await getOverallAnalytics();
    }),

  getProduct: adminProcedure
    .meta({ description: 'Get individual product views, clicks, and conversion rates (Admin only)' })
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

  getViews: adminProcedure
    .meta({ description: 'Get views telemetry for store or specific product (Admin only)' })
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

  getClicks: adminProcedure
    .meta({ description: 'Get click events telemetry (WhatsApp, Instagram, Total) (Admin only)' })
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

  getConversion: adminProcedure
    .meta({ description: 'Get conversion rates (inquiries, orders, online orders) (Admin only)' })
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

  getFunnel: adminProcedure
    .meta({ description: 'Get conversion funnel focusing specifically on online orders (Admin only)' })
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

  getChannelRatio: adminProcedure
    .meta({ description: 'Get online vs offline order ratio breakdown (Admin only)' })
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

  getGrowthPulse: adminProcedure
    .meta({ description: 'Get 30-day velocity and growth pulse for total, online, and walk-in (Admin only)' })
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

  getPaymentModes: adminProcedure
    .meta({ description: 'Get customer payment methods breakdown (Online, Cash, Credit/Khata) (Admin only)' })
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

  getCatalogueTelemetryPaginated: adminProcedure
    .meta({ description: 'Get paginated catalogue telemetry across products' })
    .input(
      z
        .object({
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
          search: z.string().nullish(),
          sortBy: z.enum(['views', 'inquiries', 'orders', 'conversion', 'revenue']).nullish().default('views'),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedCatalogueTelemetryAnalytics(input || undefined);
    }),

  getInventorySummary: adminProcedure
    .meta({ description: 'Get real-time inventory health and stock summary (Admin only)' })
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
