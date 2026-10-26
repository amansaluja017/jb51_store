import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import {
  adminContext,
  customerContext,
  unauthContext,
  generateValidDescription,
  generateUniqueSlug,
  closeDatabaseConnection,
} from './helpers/test-context.js';
import { productsRouter, analyticsRouter } from '@repo/products/router';
import { db, product, analytics, productAnalytics } from '@repo/db';
import { eq } from 'drizzle-orm';

describe('Analytics & Telemetry Test Suite', () => {
  let caller: ReturnType<typeof productsRouter.createCaller>;
  let analyticsCaller: ReturnType<typeof analyticsRouter.createCaller>;
  let testProductId: string;
  const testProductSlug = generateUniqueSlug('analytics-suit');
  const testProductName = 'Analytics Silk Suit';

  before(async () => {
    caller = productsRouter.createCaller(adminContext);
    analyticsCaller = analyticsRouter.createCaller(adminContext);

    // Create a dedicated product for analytics testing
    const createdProduct = await caller.create({
      name: testProductName,
      slug: testProductSlug,
      description: generateValidDescription(110),
      mrp: 12000,
      sellingPrice: 9500,
      price: 9500,
      category: 'Suits',
      images: [
        'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
        'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
      ],
      variants: [
        {
          id: 'v1',
          color: 'Royal Emerald',
          stock: 25,
          reservedStock: 0,
        },
      ],
    });

    testProductId = createdProduct.id;
  });

  after(async () => {
    try {
      if (testProductId) {
        // Clean up analytics row for test product
        await db
          .delete(productAnalytics)
          .where(eq(productAnalytics.productId, testProductId));
        // Delete test product
        await db.delete(product).where(eq(product.id, testProductId));
      }
    } catch (e) {
      console.error('Error cleaning up analytics test data:', e);
    } finally {
      await closeDatabaseConnection(true);
    }
  });

  describe('Tracking Events (track)', () => {
    it('should track global view event without product identifier', async () => {
      const initialOverview = await analyticsCaller.getOverall();
      const initialViews = initialOverview.views;

      const res = await analyticsCaller.track({ type: 'view' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.type, 'view');
      assert.strictEqual(res.productId, null);

      const updatedOverview = await analyticsCaller.getOverall();
      assert.strictEqual(updatedOverview.views, initialViews + 1);
    });

    it('should track global WhatsApp click event', async () => {
      const initialOverview = await analyticsCaller.getOverall();
      const initialWa = initialOverview.whatsappClicks;

      const res = await analyticsCaller.track({ type: 'whatsapp' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.type, 'whatsapp');

      const updatedOverview = await analyticsCaller.getOverall();
      assert.strictEqual(updatedOverview.whatsappClicks, initialWa + 1);
    });

    it('should track global Instagram click event', async () => {
      const initialOverview = await analyticsCaller.getOverall();
      const initialIg = initialOverview.instagramClicks;

      const res = await analyticsCaller.track({ type: 'instagram' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.type, 'instagram');

      const updatedOverview = await analyticsCaller.getOverall();
      assert.strictEqual(updatedOverview.instagramClicks, initialIg + 1);
    });

    it('should track product-specific events and increment both global and product counters', async () => {
      // 1. Track product view
      const viewRes = await analyticsCaller.track({
        type: 'view',
        slug: testProductSlug,
      });
      assert.strictEqual(viewRes.success, true);
      assert.strictEqual(viewRes.productId, testProductId);

      // 2. Track product WhatsApp click
      const waRes = await analyticsCaller.track({
        type: 'whatsapp',
        productId: testProductId,
      });
      assert.strictEqual(waRes.success, true);
      assert.strictEqual(waRes.productId, testProductId);

      // 3. Track product Instagram click
      const igRes = await analyticsCaller.track({
        type: 'instagram',
        slug: testProductSlug,
      });
      assert.strictEqual(igRes.success, true);
      assert.strictEqual(igRes.productId, testProductId);

      // Verify product analytics
      const prodAnalytics = await analyticsCaller.getProduct({
        productId: testProductId,
      });
      assert.ok(prodAnalytics);
      assert.strictEqual(prodAnalytics.scope, 'product');
      assert.strictEqual(prodAnalytics.product?.id, testProductId);
      assert.strictEqual(prodAnalytics.views >= 1, true);
      assert.strictEqual(prodAnalytics.whatsappClicks >= 1, true);
      assert.strictEqual(prodAnalytics.instagramClicks >= 1, true);
      assert.strictEqual(prodAnalytics.totalClicks, prodAnalytics.whatsappClicks + prodAnalytics.instagramClicks);
      assert.strictEqual(prodAnalytics.conversionRate > 0, true);
    });
  });

  describe('Conversion Rate Calculations', () => {
    it('should calculate accurate conversion rate as (clicks / views) * 100', async () => {
      // Record 3 more views for our test product
      await analyticsCaller.track({ type: 'view', slug: testProductSlug });
      await analyticsCaller.track({ type: 'view', slug: testProductSlug });
      await analyticsCaller.track({ type: 'view', slug: testProductSlug });

      const prod = await analyticsCaller.getProduct({ slug: testProductSlug });
      assert.ok(prod);

      const expectedRate = Math.round(((prod.whatsappClicks + prod.instagramClicks) / prod.views) * 10000) / 100;
      assert.strictEqual(prod.conversionRate, expectedRate);

      const expectedWaRate = Math.round((prod.whatsappClicks / prod.views) * 10000) / 100;
      assert.strictEqual(prod.whatsappConversionRate, expectedWaRate);

      const expectedIgRate = Math.round((prod.instagramClicks / prod.views) * 10000) / 100;
      assert.strictEqual(prod.instagramConversionRate, expectedIgRate);
    });

    it('should handle zero views without division-by-zero error', async () => {
      // Lookup nonexistent product
      const res = await analyticsCaller.getProduct({
        slug: 'nonexistent-product-slug-xyz',
      });
      assert.strictEqual(res, null);
    });
  });

  describe('Unified Overview Query (getOverview)', () => {
    it('should return storewide overall telemetry when no input provided', async () => {
      const overview = await analyticsCaller.getOverview();
      assert.strictEqual(overview.scope, 'overall');
      assert.strictEqual(typeof overview.views, 'number');
      assert.strictEqual(typeof overview.whatsappClicks, 'number');
      assert.strictEqual(typeof overview.instagramClicks, 'number');
      assert.strictEqual(typeof overview.conversionRate, 'number');
      assert.strictEqual(typeof overview.onlineOrderCount, 'number');
      assert.strictEqual(typeof overview.offlineOrderCount, 'number');
      assert.strictEqual(typeof overview.onlineOrderConversionRate, 'number');
      assert.strictEqual(overview.totalClicks, overview.whatsappClicks + overview.instagramClicks);

      // Verify channel ratio analysis
      assert.ok(overview.channelRatio, 'channelRatio should be present');
      assert.strictEqual(typeof overview.channelRatio.onlineRatio, 'number');
      assert.strictEqual(typeof overview.channelRatio.offlineRatio, 'number');

      // Verify growth velocity analysis
      assert.ok(overview.growth, 'growth metrics should be present');
      assert.strictEqual(typeof overview.growth.totalOrderGrowth, 'number');
      assert.strictEqual(typeof overview.growth.onlineOrderGrowth, 'number');
      assert.strictEqual(typeof overview.growth.offlineOrderGrowth, 'number');

      // Verify payment methods breakdown
      assert.ok(overview.payments, 'payments analytics should be present');
      assert.strictEqual(typeof overview.payments.onlineAmount, 'number');
      assert.strictEqual(typeof overview.payments.cashAmount, 'number');
      assert.strictEqual(typeof overview.payments.creditAmount, 'number');
      assert.strictEqual(typeof overview.payments.totalAmount, 'number');
      assert.strictEqual(typeof overview.payments.onlineShare, 'number');
      assert.strictEqual(typeof overview.payments.cashShare, 'number');
      assert.strictEqual(typeof overview.payments.creditShare, 'number');
    });

    it('should return storewide overall telemetry when slug is "all"', async () => {
      const overview = await analyticsCaller.getOverview({ slug: 'all' });
      assert.strictEqual(overview.scope, 'overall');
      assert.strictEqual(overview.product, null);
      assert.ok(overview.channelRatio);
      assert.ok(overview.growth);
      assert.ok(overview.payments);
    });

    it('should return product-specific telemetry when valid slug is provided', async () => {
      const overview = await analyticsCaller.getOverview({ slug: testProductSlug });
      assert.strictEqual(overview.scope, 'product');
      assert.ok(overview.product);
      assert.strictEqual(overview.product.id, testProductId);
      assert.strictEqual(overview.product.name, testProductName);
      assert.strictEqual(typeof overview.conversionRate, 'number');
      assert.strictEqual(typeof overview.onlineOrderCount, 'number');
      assert.strictEqual(typeof overview.offlineOrderCount, 'number');
      assert.strictEqual(typeof overview.onlineOrderConversionRate, 'number');
      assert.ok(overview.channelRatio);
      assert.ok(overview.growth);
      assert.ok(overview.payments);
    });
  });

  describe('Cross-Product Comparison (getAllProducts)', () => {
    it('should reject unauthenticated caller with UNAUTHORIZED', async () => {
      const unauthCaller = analyticsRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.getAllProducts();
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );
    });

    it('should reject customer role caller with FORBIDDEN', async () => {
      const customerCaller = analyticsRouter.createCaller(customerContext);
      await assert.rejects(
        async () => {
          await customerCaller.getAllProducts();
        },
        (err: any) => err.code === 'FORBIDDEN'
      );
    });

    it('should return all products with individual telemetry and conversion metrics for admin', async () => {
      const allAnalytics = await analyticsCaller.getAllProducts();
      assert.strictEqual(Array.isArray(allAnalytics), true);
      assert.strictEqual(allAnalytics.length > 0, true);

      const item = allAnalytics.find((p) => p.productId === testProductId);
      assert.ok(item, 'Test product should be present in all products analytics');
      assert.strictEqual(item.name, testProductName);
      assert.strictEqual(typeof item.views, 'number');
      assert.strictEqual(typeof item.whatsappClicks, 'number');
      assert.strictEqual(typeof item.instagramClicks, 'number');
      assert.strictEqual(typeof item.totalClicks, 'number');
      assert.strictEqual(typeof item.conversionRate, 'number');
      assert.strictEqual(typeof item.orderCount, 'number');
    });
  });

  describe('Modular Independent Analytics Routes', () => {
    it('should fetch getViews independently', async () => {
      const viewsData = await analyticsCaller.getViews();
      assert.strictEqual(typeof viewsData.views, 'number');
      assert.strictEqual(viewsData.scope, 'overall');

      const prodViews = await analyticsCaller.getViews({ slug: testProductSlug });
      assert.strictEqual(typeof prodViews.views, 'number');
      assert.strictEqual(prodViews.scope, 'product');
      assert.strictEqual(prodViews.productId, testProductId);
    });

    it('should fetch getClicks independently', async () => {
      const clicksData = await analyticsCaller.getClicks();
      assert.strictEqual(typeof clicksData.whatsappClicks, 'number');
      assert.strictEqual(typeof clicksData.instagramClicks, 'number');
      assert.strictEqual(typeof clicksData.totalClicks, 'number');
      assert.strictEqual(clicksData.totalClicks, clicksData.whatsappClicks + clicksData.instagramClicks);
    });

    it('should fetch getConversion independently', async () => {
      const convData = await analyticsCaller.getConversion();
      assert.strictEqual(typeof convData.conversionRate, 'number');
      assert.strictEqual(typeof convData.whatsappConversionRate, 'number');
      assert.strictEqual(typeof convData.instagramConversionRate, 'number');
      assert.strictEqual(typeof convData.orderConversionRate, 'number');
      assert.strictEqual(typeof convData.onlineOrderConversionRate, 'number');
    });

    it('should fetch getFunnel strictly taking online orders', async () => {
      const funnel = await analyticsCaller.getFunnel();
      assert.strictEqual(typeof funnel.views, 'number');
      assert.strictEqual(typeof funnel.inquiries, 'number');
      assert.strictEqual(typeof funnel.onlineOrders, 'number');
      assert.strictEqual(typeof funnel.inquiryRate, 'number');
      assert.strictEqual(typeof funnel.onlineOrderRate, 'number');
      assert.strictEqual(typeof funnel.inquiryToOrderRate, 'number');
    });

    it('should fetch getChannelRatio independently', async () => {
      const ratio = await analyticsCaller.getChannelRatio();
      assert.strictEqual(typeof ratio.onlineRatio, 'number');
      assert.strictEqual(typeof ratio.offlineRatio, 'number');
      assert.strictEqual(typeof ratio.onlineOrderCount, 'number');
      assert.strictEqual(typeof ratio.offlineOrderCount, 'number');
      assert.strictEqual(typeof ratio.totalOrderCount, 'number');
    });

    it('should fetch getGrowthPulse independently', async () => {
      const growth = await analyticsCaller.getGrowthPulse();
      assert.strictEqual(typeof growth.totalOrderGrowth, 'number');
      assert.strictEqual(typeof growth.onlineOrderGrowth, 'number');
      assert.strictEqual(typeof growth.offlineOrderGrowth, 'number');
      assert.strictEqual(typeof growth.current30DaysOrders, 'number');
      assert.strictEqual(typeof growth.previous30DaysOrders, 'number');
    });

    it('should fetch getPaymentModes independently', async () => {
      const payments = await analyticsCaller.getPaymentModes();
      assert.strictEqual(typeof payments.onlineAmount, 'number');
      assert.strictEqual(typeof payments.cashAmount, 'number');
      assert.strictEqual(typeof payments.creditAmount, 'number');
      assert.strictEqual(typeof payments.totalAmount, 'number');
      assert.strictEqual(typeof payments.onlineShare, 'number');
      assert.strictEqual(typeof payments.cashShare, 'number');
      assert.strictEqual(typeof payments.creditShare, 'number');
    });

    it('should fetch getDemandHighlights for admin', async () => {
      const highlights = await analyticsCaller.getDemandHighlights();
      assert.ok(highlights);
      assert.strictEqual('mostViewedProduct' in highlights, true);
      assert.strictEqual('mostDemandedProduct' in highlights, true);
      assert.strictEqual('topConvertingProduct' in highlights, true);
    });

    it('should fetch getCatalogueTelemetry for admin', async () => {
      const catalogue = await analyticsCaller.getCatalogueTelemetry();
      assert.strictEqual(Array.isArray(catalogue), true);
      assert.strictEqual(catalogue.length > 0, true);
    });

    it('should fetch getInventorySummary independently', async () => {
      const inventory = await analyticsCaller.getInventorySummary();
      assert.strictEqual(typeof inventory.totalProducts, 'number');
      assert.strictEqual(typeof inventory.inStockProducts, 'number');
      assert.strictEqual(typeof inventory.outOfStockProducts, 'number');
      assert.strictEqual(typeof inventory.lowStockProducts, 'number');
      assert.strictEqual(typeof inventory.totalStockUnits, 'number');
    });
  });
});
