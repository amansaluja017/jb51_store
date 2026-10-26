import {
  db,
  analytics as analyticsTable,
  productAnalytics as productAnalyticsTable,
  product as productTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  credits as creditsTable,
} from '@repo/db';
import { eq, sql } from 'drizzle-orm';
import { matchesSlug, getProducts, Product } from './data.js';

export interface TrackEventInput {
  type: 'view' | 'whatsapp' | 'instagram';
  productId?: string | null;
  slug?: string | null;
}

export interface OrderChannelRatio {
  onlineRatio: number;   // % of total orders
  offlineRatio: number;  // % of total orders
}

export interface GrowthMetrics {
  totalOrderGrowth: number;   // % change (recent 30d vs previous 30d)
  onlineOrderGrowth: number;  // % change
  offlineOrderGrowth: number; // % change
  current30DaysOrders: number;
  previous30DaysOrders: number;
  current30DaysOnline: number;
  previous30DaysOnline: number;
  current30DaysOffline: number;
  previous30DaysOffline: number;
}

export interface PaymentAnalytics {
  onlineAmount: number;
  cashAmount: number;
  creditAmount: number;
  totalAmount: number;
  onlineShare: number; // % of total revenue
  cashShare: number;   // % of total revenue
  creditShare: number; // % of total revenue
  onlineCount: number;
  cashCount: number;
  creditCount: number;
  creditDueAmount: number;
  creditPaidAmount: number;
}
export interface ViewsAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  views: number;
}

export interface ClicksAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
}

export interface ConversionAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  conversionRate: number;
  whatsappConversionRate: number;
  instagramConversionRate: number;
  orderConversionRate: number;
  onlineOrderConversionRate: number;
}

export interface ConversionFunnelAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  views: number;
  inquiries: number;
  onlineOrders: number;
  inquiryRate: number;
  onlineOrderRate: number;
  inquiryToOrderRate: number;
}

export interface ChannelRatioAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  onlineRatio: number;
  offlineRatio: number;
  onlineOrderCount: number;
  offlineOrderCount: number;
  totalOrderCount: number;
}

export interface GrowthPulseAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  totalOrderGrowth: number;
  onlineOrderGrowth: number;
  offlineOrderGrowth: number;
  current30DaysOrders: number;
  previous30DaysOrders: number;
  current30DaysOnline: number;
  previous30DaysOnline: number;
  current30DaysOffline: number;
  previous30DaysOffline: number;
}

export interface PaymentModesAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  onlineAmount: number;
  cashAmount: number;
  creditAmount: number;
  totalAmount: number;
  onlineShare: number;
  cashShare: number;
  creditShare: number;
  onlineCount: number;
  cashCount: number;
  creditCount: number;
  creditDueAmount: number;
  creditPaidAmount: number;
}

export interface DemandHighlightsAnalytics {
  mostViewedProduct: ProductAnalyticsItem | null;
  mostDemandedProduct: ProductAnalyticsItem | null;
  topConvertingProduct: ProductAnalyticsItem | null;
}

export interface InventorySummaryAnalytics {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  hasReservedProducts: number;
  totalStockUnits: number;
  totalReservedUnits: number;
}

export interface AnalyticsSummary {
  scope: 'overall' | 'product';
  product?: {
    id: string;
    slug: string;
    name: string;
    category?: string | null;
    price?: number | null;
  } | null;
  views: number;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
  conversionRate: number; // (whatsappClicks + instagramClicks) / views * 100
  whatsappConversionRate: number; // whatsappClicks / views * 100
  instagramConversionRate: number; // instagramClicks / views * 100
  orderCount?: number;
  onlineOrderCount?: number;
  offlineOrderCount?: number;
  orderConversionRate?: number;
  onlineOrderConversionRate?: number;
  channelRatio?: OrderChannelRatio;
  growth?: GrowthMetrics;
  payments?: PaymentAnalytics;
  updatedAt?: string | null;
}

export interface ProductAnalyticsItem {
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  views: number;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
  conversionRate: number;
  orderCount: number;
  onlineOrderCount: number;
  offlineOrderCount: number;
  onlineOrderConversionRate: number;
  onlineOrderRatio: number;
  offlineOrderRatio: number;
  onlineRevenue: number;
  cashRevenue: number;
  creditRevenue: number;
  totalRevenue: number;
}

function calculateRate(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

/**
 * Record an analytics event (view, WhatsApp click, Instagram click).
 * Increments both global analytics and product-specific analytics when product is identified.
 */
export async function trackAnalyticsEvent(input: TrackEventInput) {
  const { type, productId, slug } = input;
  if (!['view', 'whatsapp', 'instagram'].includes(type)) {
    throw new Error(`Invalid event type: ${type}`);
  }

  // 1. Resolve product if identifier provided
  let targetProduct: Product | undefined;
  if (productId || (slug && slug !== 'all')) {
    const allProds = await getProducts();
    if (productId) {
      targetProduct = allProds.find((p) => p.id === productId);
    }
    if (!targetProduct && slug && slug !== 'all') {
      targetProduct = allProds.find((p) => matchesSlug(p, slug));
    }
  }

  return await db.transaction(async (tx) => {
    // 2. Update Global Analytics Table
    const [existingGlobal] = await tx.select().from(analyticsTable);
    if (!existingGlobal) {
      await tx.insert(analyticsTable).values({
        views: type === 'view' ? 1 : 0,
        whatsappClicks: type === 'whatsapp' ? 1 : 0,
        instagramClicks: type === 'instagram' ? 1 : 0,
      });
    } else {
      await tx
        .update(analyticsTable)
        .set({
          views: type === 'view' ? existingGlobal.views + 1 : existingGlobal.views,
          whatsappClicks:
            type === 'whatsapp'
              ? existingGlobal.whatsappClicks + 1
              : existingGlobal.whatsappClicks,
          instagramClicks:
            type === 'instagram'
              ? existingGlobal.instagramClicks + 1
              : existingGlobal.instagramClicks,
          updatedAt: new Date(),
        })
        .where(eq(analyticsTable.id, existingGlobal.id));
    }

    // 3. Update Product Analytics Table if target product resolved
    if (targetProduct) {
      const [existingProdAnalytics] = await tx
        .select()
        .from(productAnalyticsTable)
        .where(eq(productAnalyticsTable.productId, targetProduct.id));

      if (!existingProdAnalytics) {
        await tx.insert(productAnalyticsTable).values({
          productId: targetProduct.id,
          views: type === 'view' ? 1 : 0,
          whatsappClicks: type === 'whatsapp' ? 1 : 0,
          instagramClicks: type === 'instagram' ? 1 : 0,
        });
      } else {
        await tx
          .update(productAnalyticsTable)
          .set({
            views:
              type === 'view'
                ? existingProdAnalytics.views + 1
                : existingProdAnalytics.views,
            whatsappClicks:
              type === 'whatsapp'
                ? existingProdAnalytics.whatsappClicks + 1
                : existingProdAnalytics.whatsappClicks,
            instagramClicks:
              type === 'instagram'
                ? existingProdAnalytics.instagramClicks + 1
                : existingProdAnalytics.instagramClicks,
            updatedAt: new Date(),
          })
          .where(eq(productAnalyticsTable.id, existingProdAnalytics.id));
      }
    }

    return {
      success: true,
      type,
      productId: targetProduct?.id || null,
      slug: targetProduct?.slug || null,
    };
  });
}

/**
 * Get overall store analytics summary, clicks, and conversion rates.
 */
export async function getOverallAnalytics(): Promise<AnalyticsSummary> {
  const globalRows = await db.select().from(analyticsTable);
  const [primary] = globalRows;

  const views = primary?.views || 0;
  const whatsappClicks = primary?.whatsappClicks || 0;
  const instagramClicks = primary?.instagramClicks || 0;
  const totalClicks = whatsappClicks + instagramClicks;

  const [ordersSummary] = await db
    .select({
      totalCount: sql<number>`count(*)`,
      onlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online')`,
      offlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null)`,
      onlineAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'online' then ${ordersTable.totalAmount}::numeric else 0 end), 0)`,
      cashAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'cash' then ${ordersTable.totalAmount}::numeric else 0 end), 0)`,
      creditAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'credit' then ${ordersTable.totalAmount}::numeric else 0 end), 0)`,
      totalAmount: sql<number>`coalesce(sum(${ordersTable.totalAmount}::numeric), 0)`,
      onlinePaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'online')`,
      cashPaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'cash')`,
      creditPaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'credit')`,
      current30DaysOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
      current30DaysOnline: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online' and ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOnline: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online' and ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
      current30DaysOffline: sql<number>`count(*) filter (where (${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null) and ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOffline: sql<number>`count(*) filter (where (${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null) and ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
    })
    .from(ordersTable);

  const [creditsSummary] = await db
    .select({
      totalDue: sql<number>`coalesce(sum(${creditsTable.dueAmount}::numeric), 0)`,
      totalPaid: sql<number>`coalesce(sum(${creditsTable.paidAmount}::numeric), 0)`,
    })
    .from(creditsTable);

  const orderCount = Number(ordersSummary?.totalCount) || 0;
  const onlineOrderCount = Number(ordersSummary?.onlineCount) || 0;
  const offlineOrderCount = Number(ordersSummary?.offlineCount) || 0;

  const onlineRatio = calculateRate(onlineOrderCount, orderCount);
  const offlineRatio = calculateRate(offlineOrderCount, orderCount);

  const cur30Orders = Number(ordersSummary?.current30DaysOrders) || 0;
  const prev30Orders = Number(ordersSummary?.previous30DaysOrders) || 0;
  const cur30Online = Number(ordersSummary?.current30DaysOnline) || 0;
  const prev30Online = Number(ordersSummary?.previous30DaysOnline) || 0;
  const cur30Offline = Number(ordersSummary?.current30DaysOffline) || 0;
  const prev30Offline = Number(ordersSummary?.previous30DaysOffline) || 0;

  const onlineAmount = Number(ordersSummary?.onlineAmount) || 0;
  const cashAmount = Number(ordersSummary?.cashAmount) || 0;
  const creditAmount = Number(ordersSummary?.creditAmount) || 0;
  const totalAmount = Number(ordersSummary?.totalAmount) || 0;

  return {
    scope: 'overall',
    product: null,
    views,
    whatsappClicks,
    instagramClicks,
    totalClicks,
    conversionRate: calculateRate(totalClicks, views),
    whatsappConversionRate: calculateRate(whatsappClicks, views),
    instagramConversionRate: calculateRate(instagramClicks, views),
    orderCount,
    onlineOrderCount,
    offlineOrderCount,
    orderConversionRate: calculateRate(orderCount, views),
    onlineOrderConversionRate: calculateRate(onlineOrderCount, views),
    channelRatio: {
      onlineRatio,
      offlineRatio,
    },
    growth: {
      totalOrderGrowth: calculateGrowth(cur30Orders, prev30Orders),
      onlineOrderGrowth: calculateGrowth(cur30Online, prev30Online),
      offlineOrderGrowth: calculateGrowth(cur30Offline, prev30Offline),
      current30DaysOrders: cur30Orders,
      previous30DaysOrders: prev30Orders,
      current30DaysOnline: cur30Online,
      previous30DaysOnline: prev30Online,
      current30DaysOffline: cur30Offline,
      previous30DaysOffline: prev30Offline,
    },
    payments: {
      onlineAmount,
      cashAmount,
      creditAmount,
      totalAmount,
      onlineShare: calculateRate(onlineAmount, totalAmount),
      cashShare: calculateRate(cashAmount, totalAmount),
      creditShare: calculateRate(creditAmount, totalAmount),
      onlineCount: Number(ordersSummary?.onlinePaymentCount) || 0,
      cashCount: Number(ordersSummary?.cashPaymentCount) || 0,
      creditCount: Number(ordersSummary?.creditPaymentCount) || 0,
      creditDueAmount: Number(creditsSummary?.totalDue) || 0,
      creditPaidAmount: Number(creditsSummary?.totalPaid) || 0,
    },
    updatedAt: primary?.updatedAt ? new Date(primary.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Get individual product analytics summary, clicks, and conversion rates.
 */
export async function getProductAnalytics(identifier: {
  productId?: string | null;
  slug?: string | null;
}): Promise<AnalyticsSummary | null> {
  const prods = await getProducts();
  let targetProduct = identifier.productId
    ? prods.find((p) => p.id === identifier.productId)
    : undefined;

  if (!targetProduct && identifier.slug && identifier.slug !== 'all') {
    targetProduct = prods.find((p) => matchesSlug(p, identifier.slug!));
  }

  if (!targetProduct) {
    return null;
  }

  const [analyticsRow] = await db
    .select()
    .from(productAnalyticsTable)
    .where(eq(productAnalyticsTable.productId, targetProduct.id));

  const views = analyticsRow?.views || 0;
  const whatsappClicks = analyticsRow?.whatsappClicks || 0;
  const instagramClicks = analyticsRow?.instagramClicks || 0;
  const totalClicks = whatsappClicks + instagramClicks;

  const [prodOrders] = await db
    .select({
      totalCount: sql<number>`count(*)`,
      onlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online')`,
      offlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null)`,
      onlineAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'online' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      cashAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'cash' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      creditAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'credit' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      totalAmount: sql<number>`coalesce(sum(${orderItemsTable.total}::numeric), 0)`,
      onlinePaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'online')`,
      cashPaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'cash')`,
      creditPaymentCount: sql<number>`count(*) filter (where ${ordersTable.paymentMethod} = 'credit')`,
      current30DaysOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
      current30DaysOnline: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online' and ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOnline: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online' and ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
      current30DaysOffline: sql<number>`count(*) filter (where (${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null) and ${ordersTable.createdAt} >= now() - interval '30 days')`,
      previous30DaysOffline: sql<number>`count(*) filter (where (${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null) and ${ordersTable.createdAt} >= now() - interval '60 days' and ${ordersTable.createdAt} < now() - interval '30 days')`,
    })
    .from(orderItemsTable)
    .leftJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(eq(orderItemsTable.productId, targetProduct.id));

  const orderCount = Number(prodOrders?.totalCount) || 0;
  const onlineOrderCount = Number(prodOrders?.onlineCount) || 0;
  const offlineOrderCount = Number(prodOrders?.offlineCount) || 0;

  const onlineRatio = calculateRate(onlineOrderCount, orderCount);
  const offlineRatio = calculateRate(offlineOrderCount, orderCount);

  const cur30Orders = Number(prodOrders?.current30DaysOrders) || 0;
  const prev30Orders = Number(prodOrders?.previous30DaysOrders) || 0;
  const cur30Online = Number(prodOrders?.current30DaysOnline) || 0;
  const prev30Online = Number(prodOrders?.previous30DaysOnline) || 0;
  const cur30Offline = Number(prodOrders?.current30DaysOffline) || 0;
  const prev30Offline = Number(prodOrders?.previous30DaysOffline) || 0;

  const onlineAmount = Number(prodOrders?.onlineAmount) || 0;
  const cashAmount = Number(prodOrders?.cashAmount) || 0;
  const creditAmount = Number(prodOrders?.creditAmount) || 0;
  const totalAmount = Number(prodOrders?.totalAmount) || 0;

  return {
    scope: 'product',
    product: {
      id: targetProduct.id,
      slug: targetProduct.slug,
      name: targetProduct.name,
      category: targetProduct.category,
      price: targetProduct.price ? Number(targetProduct.price) : 0,
    },
    views,
    whatsappClicks,
    instagramClicks,
    totalClicks,
    conversionRate: calculateRate(totalClicks, views),
    whatsappConversionRate: calculateRate(whatsappClicks, views),
    instagramConversionRate: calculateRate(instagramClicks, views),
    orderCount,
    onlineOrderCount,
    offlineOrderCount,
    orderConversionRate: calculateRate(orderCount, views),
    onlineOrderConversionRate: calculateRate(onlineOrderCount, views),
    channelRatio: {
      onlineRatio,
      offlineRatio,
    },
    growth: {
      totalOrderGrowth: calculateGrowth(cur30Orders, prev30Orders),
      onlineOrderGrowth: calculateGrowth(cur30Online, prev30Online),
      offlineOrderGrowth: calculateGrowth(cur30Offline, prev30Offline),
      current30DaysOrders: cur30Orders,
      previous30DaysOrders: prev30Orders,
      current30DaysOnline: cur30Online,
      previous30DaysOnline: prev30Online,
      current30DaysOffline: cur30Offline,
      previous30DaysOffline: prev30Offline,
    },
    payments: {
      onlineAmount,
      cashAmount,
      creditAmount,
      totalAmount,
      onlineShare: calculateRate(onlineAmount, totalAmount),
      cashShare: calculateRate(cashAmount, totalAmount),
      creditShare: calculateRate(creditAmount, totalAmount),
      onlineCount: Number(prodOrders?.onlinePaymentCount) || 0,
      cashCount: Number(prodOrders?.cashPaymentCount) || 0,
      creditCount: Number(prodOrders?.creditPaymentCount) || 0,
      creditDueAmount: 0,
      creditPaidAmount: 0,
    },
    updatedAt: analyticsRow?.updatedAt
      ? new Date(analyticsRow.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Get unified overview analytics: either for a specific product or overall store.
 */
export async function getAnalyticsOverview(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<AnalyticsSummary> {
  if (
    (options?.slug && options.slug !== 'all') ||
    options?.productId
  ) {
    const prodRes = await getProductAnalytics(options);
    if (prodRes) return prodRes;
  }
  return await getOverallAnalytics();
}

/**
 * Get analytics comparison list across all products.
 */
export async function getAllProductsAnalytics(): Promise<ProductAnalyticsItem[]> {
  const allProds = await getProducts();
  const allAnalytics = await db.select().from(productAnalyticsTable);
  const analyticsByProdId = new Map(allAnalytics.map((a) => [a.productId, a]));

  const orderCountsResult = await db
    .select({
      productId: orderItemsTable.productId,
      totalCount: sql<number>`count(*)`,
      onlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'online')`,
      offlineCount: sql<number>`count(*) filter (where ${ordersTable.orderType} = 'offline' or ${ordersTable.orderType} is null)`,
      onlineAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'online' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      cashAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'cash' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      creditAmount: sql<number>`coalesce(sum(case when ${ordersTable.paymentMethod} = 'credit' then ${orderItemsTable.total}::numeric else 0 end), 0)`,
      totalAmount: sql<number>`coalesce(sum(${orderItemsTable.total}::numeric), 0)`,
    })
    .from(orderItemsTable)
    .leftJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .groupBy(orderItemsTable.productId);

  const orderCountMap = new Map(
    orderCountsResult
      .filter((r) => r.productId)
      .map((r) => [
        r.productId!,
        {
          total: Number(r.totalCount) || 0,
          online: Number(r.onlineCount) || 0,
          offline: Number(r.offlineCount) || 0,
          onlineAmount: Number(r.onlineAmount) || 0,
          cashAmount: Number(r.cashAmount) || 0,
          creditAmount: Number(r.creditAmount) || 0,
          totalAmount: Number(r.totalAmount) || 0,
        },
      ])
  );

  return allProds.map((p) => {
    const a = analyticsByProdId.get(p.id);
    const views = a?.views || 0;
    const whatsappClicks = a?.whatsappClicks || 0;
    const instagramClicks = a?.instagramClicks || 0;
    const totalClicks = whatsappClicks + instagramClicks;
    const counts = orderCountMap.get(p.id) || {
      total: 0,
      online: 0,
      offline: 0,
      onlineAmount: 0,
      cashAmount: 0,
      creditAmount: 0,
      totalAmount: 0,
    };
    const orderCount = counts.total;
    const onlineOrderCount = counts.online;
    const offlineOrderCount = counts.offline;

    return {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category || 'Uncategorized',
      price: p.price ? Number(p.price) : 0,
      views,
      whatsappClicks,
      instagramClicks,
      totalClicks,
      conversionRate: calculateRate(totalClicks, views),
      orderCount,
      onlineOrderCount,
      offlineOrderCount,
      onlineOrderConversionRate: calculateRate(onlineOrderCount, views),
      onlineOrderRatio: calculateRate(onlineOrderCount, orderCount),
      offlineOrderRatio: calculateRate(offlineOrderCount, orderCount),
      onlineRevenue: counts.onlineAmount,
      cashRevenue: counts.cashAmount,
      creditRevenue: counts.creditAmount,
      totalRevenue: counts.totalAmount,
    };
  });
}

/**
 * Helper to resolve target product from slug or id safely.
 */
async function resolveTargetProduct(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<Product | undefined> {
  if (!options?.productId && (!options?.slug || options.slug === 'all')) {
    return undefined;
  }
  const allProds = await getProducts();
  if (options.productId) {
    const found = allProds.find((p) => p.id === options.productId);
    if (found) return found;
  }
  if (options.slug && options.slug !== 'all') {
    return allProds.find((p) => matchesSlug(p, options.slug!));
  }
  return undefined;
}

/**
 * 1. Modular Views Route Handler
 */
export async function getViewsAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<ViewsAnalytics> {
  try {
    const target = await resolveTargetProduct(options);
    if (target) {
      const [row] = await db
        .select({ views: productAnalyticsTable.views })
        .from(productAnalyticsTable)
        .where(eq(productAnalyticsTable.productId, target.id));
      return {
        scope: 'product',
        productId: target.id,
        slug: target.slug,
        views: row?.views || 0,
      };
    }
    const [globalRow] = await db.select({ views: analyticsTable.views }).from(analyticsTable);
    return {
      scope: 'overall',
      productId: null,
      slug: null,
      views: globalRow?.views || 0,
    };
  } catch (err) {
    console.warn('[getViewsAnalytics Error]:', err);
    return { scope: 'overall', views: 0 };
  }
}

/**
 * 2. Modular Clicks Route Handler
 */
export async function getClicksAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<ClicksAnalytics> {
  try {
    const target = await resolveTargetProduct(options);
    if (target) {
      const [row] = await db
        .select({
          whatsappClicks: productAnalyticsTable.whatsappClicks,
          instagramClicks: productAnalyticsTable.instagramClicks,
        })
        .from(productAnalyticsTable)
        .where(eq(productAnalyticsTable.productId, target.id));
      const whatsappClicks = row?.whatsappClicks || 0;
      const instagramClicks = row?.instagramClicks || 0;
      return {
        scope: 'product',
        productId: target.id,
        slug: target.slug,
        whatsappClicks,
        instagramClicks,
        totalClicks: whatsappClicks + instagramClicks,
      };
    }
    const [globalRow] = await db
      .select({
        whatsappClicks: analyticsTable.whatsappClicks,
        instagramClicks: analyticsTable.instagramClicks,
      })
      .from(analyticsTable);
    const whatsappClicks = globalRow?.whatsappClicks || 0;
    const instagramClicks = globalRow?.instagramClicks || 0;
    return {
      scope: 'overall',
      productId: null,
      slug: null,
      whatsappClicks,
      instagramClicks,
      totalClicks: whatsappClicks + instagramClicks,
    };
  } catch (err) {
    console.warn('[getClicksAnalytics Error]:', err);
    return {
      scope: 'overall',
      whatsappClicks: 0,
      instagramClicks: 0,
      totalClicks: 0,
    };
  }
}

/**
 * 3. Modular Conversion Route Handler
 */
export async function getConversionAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<ConversionAnalytics> {
  try {
    const overview = await getAnalyticsOverview(options);
    return {
      scope: overview.scope,
      productId: overview.product?.id || null,
      slug: overview.product?.slug || null,
      conversionRate: overview.conversionRate,
      whatsappConversionRate: overview.whatsappConversionRate,
      instagramConversionRate: overview.instagramConversionRate,
      orderConversionRate: overview.orderConversionRate || 0,
      onlineOrderConversionRate: overview.onlineOrderConversionRate || 0,
    };
  } catch (err) {
    console.warn('[getConversionAnalytics Error]:', err);
    return {
      scope: 'overall',
      conversionRate: 0,
      whatsappConversionRate: 0,
      instagramConversionRate: 0,
      orderConversionRate: 0,
      onlineOrderConversionRate: 0,
    };
  }
}

/**
 * 4. Modular Conversion Funnel Route Handler (STRICTLY taking online orders)
 */
export async function getFunnelAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<ConversionFunnelAnalytics> {
  try {
    const overview = await getAnalyticsOverview(options);
    const views = overview.views || 0;
    const inquiries = overview.totalClicks || 0;
    // Conversion funnel takes ONLY the online orders as requested
    const onlineOrders = overview.onlineOrderCount || 0;

    const inquiryRate = calculateRate(inquiries, views);
    const onlineOrderRate = calculateRate(onlineOrders, views);
    const inquiryToOrderRate = calculateRate(onlineOrders, inquiries);

    return {
      scope: overview.scope,
      productId: overview.product?.id || null,
      slug: overview.product?.slug || null,
      views,
      inquiries,
      onlineOrders,
      inquiryRate,
      onlineOrderRate,
      inquiryToOrderRate,
    };
  } catch (err) {
    console.warn('[getFunnelAnalytics Error]:', err);
    return {
      scope: 'overall',
      views: 0,
      inquiries: 0,
      onlineOrders: 0,
      inquiryRate: 0,
      onlineOrderRate: 0,
      inquiryToOrderRate: 0,
    };
  }
}

/**
 * 5. Modular Channel Ratio Route Handler
 */
export async function getChannelRatioAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<ChannelRatioAnalytics> {
  try {
    const overview = await getAnalyticsOverview(options);
    return {
      scope: overview.scope,
      productId: overview.product?.id || null,
      slug: overview.product?.slug || null,
      onlineRatio: overview.channelRatio?.onlineRatio || 0,
      offlineRatio: overview.channelRatio?.offlineRatio || 0,
      onlineOrderCount: overview.onlineOrderCount || 0,
      offlineOrderCount: overview.offlineOrderCount || 0,
      totalOrderCount: overview.orderCount || 0,
    };
  } catch (err) {
    console.warn('[getChannelRatioAnalytics Error]:', err);
    return {
      scope: 'overall',
      onlineRatio: 0,
      offlineRatio: 0,
      onlineOrderCount: 0,
      offlineOrderCount: 0,
      totalOrderCount: 0,
    };
  }
}

/**
 * 6. Modular Growth Pulse Route Handler
 */
export async function getGrowthPulseAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<GrowthPulseAnalytics> {
  try {
    const overview = await getAnalyticsOverview(options);
    const g = overview.growth || {
      totalOrderGrowth: 0,
      onlineOrderGrowth: 0,
      offlineOrderGrowth: 0,
      current30DaysOrders: 0,
      previous30DaysOrders: 0,
      current30DaysOnline: 0,
      previous30DaysOnline: 0,
      current30DaysOffline: 0,
      previous30DaysOffline: 0,
    };
    return {
      scope: overview.scope,
      productId: overview.product?.id || null,
      slug: overview.product?.slug || null,
      ...g,
    };
  } catch (err) {
    console.warn('[getGrowthPulseAnalytics Error]:', err);
    return {
      scope: 'overall',
      totalOrderGrowth: 0,
      onlineOrderGrowth: 0,
      offlineOrderGrowth: 0,
      current30DaysOrders: 0,
      previous30DaysOrders: 0,
      current30DaysOnline: 0,
      previous30DaysOnline: 0,
      current30DaysOffline: 0,
      previous30DaysOffline: 0,
    };
  }
}

/**
 * 7. Modular Payment Modes Route Handler
 */
export async function getPaymentModesAnalytics(options?: {
  slug?: string | null;
  productId?: string | null;
}): Promise<PaymentModesAnalytics> {
  try {
    const overview = await getAnalyticsOverview(options);
    const p = overview.payments || {
      onlineAmount: 0,
      cashAmount: 0,
      creditAmount: 0,
      totalAmount: 0,
      onlineShare: 0,
      cashShare: 0,
      creditShare: 0,
      onlineCount: 0,
      cashCount: 0,
      creditCount: 0,
      creditDueAmount: 0,
      creditPaidAmount: 0,
    };
    return {
      scope: overview.scope,
      productId: overview.product?.id || null,
      slug: overview.product?.slug || null,
      ...p,
    };
  } catch (err) {
    console.warn('[getPaymentModesAnalytics Error]:', err);
    return {
      scope: 'overall',
      onlineAmount: 0,
      cashAmount: 0,
      creditAmount: 0,
      totalAmount: 0,
      onlineShare: 0,
      cashShare: 0,
      creditShare: 0,
      onlineCount: 0,
      cashCount: 0,
      creditCount: 0,
      creditDueAmount: 0,
      creditPaidAmount: 0,
    };
  }
}

/**
 * 8. Modular Demand Highlights Route Handler
 */
export async function getDemandHighlightsAnalytics(): Promise<DemandHighlightsAnalytics> {
  try {
    const prods = await getAllProductsAnalytics();
    if (!prods || prods.length === 0) {
      return {
        mostViewedProduct: null,
        mostDemandedProduct: null,
        topConvertingProduct: null,
      };
    }
    const mostViewedProduct = [...prods].sort((a, b) => b.views - a.views)[0] || null;
    const mostDemandedProduct = [...prods].sort((a, b) => b.totalClicks - a.totalClicks)[0] || null;
    const withViews = prods.filter((p) => p.views > 0);
    const topConvertingProduct =
      withViews.length > 0
        ? [...withViews].sort((a, b) => b.conversionRate - a.conversionRate)[0]
        : prods[0] || null;

    return {
      mostViewedProduct,
      mostDemandedProduct,
      topConvertingProduct,
    };
  } catch (err) {
    console.warn('[getDemandHighlightsAnalytics Error]:', err);
    return {
      mostViewedProduct: null,
      mostDemandedProduct: null,
      topConvertingProduct: null,
    };
  }
}

/**
 * 9. Modular Catalogue Telemetry Route Handler
 */
export async function getCatalogueTelemetryAnalytics(): Promise<ProductAnalyticsItem[]> {
  try {
    return await getAllProductsAnalytics();
  } catch (err) {
    console.warn('[getCatalogueTelemetryAnalytics Error]:', err);
    return [];
  }
}

/**
 * 10. Modular Inventory Summary Route Handler
 */
export async function getInventorySummaryAnalytics(): Promise<InventorySummaryAnalytics> {
  try {
    const allProducts = await getProducts();
    const LOW_STOCK_THRESHOLD = 5;
    let inStockProducts = 0;
    let outOfStockProducts = 0;
    let lowStockProducts = 0;
    let hasReservedProducts = 0;
    let totalStockUnits = 0;
    let totalReservedUnits = 0;

    allProducts.forEach((product) => {
      const variants = product.variants || [];
      const prodStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      const prodReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);
      const isInStock = product.inStock !== false && prodStock > 0;

      if (isInStock) {
        inStockProducts++;
      } else {
        outOfStockProducts++;
      }

      if (prodReserved > 0) {
        hasReservedProducts++;
      }

      if (isInStock && prodStock > 0 && prodStock <= LOW_STOCK_THRESHOLD) {
        lowStockProducts++;
      }

      totalStockUnits += prodStock;
      totalReservedUnits += prodReserved;
    });

    return {
      totalProducts: allProducts.length,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      hasReservedProducts,
      totalStockUnits,
      totalReservedUnits,
    };
  } catch (err) {
    console.warn('[getInventorySummaryAnalytics Error]:', err);
    return {
      totalProducts: 0,
      inStockProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
      hasReservedProducts: 0,
      totalStockUnits: 0,
      totalReservedUnits: 0,
    };
  }
}

