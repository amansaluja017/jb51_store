import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { closeDatabaseConnection } from './helpers/test-context.js';
import { appRouter, createTRPCContext } from '../../../apps/api/src/router.js';
import { generateAccessToken } from '@repo/auth/jwt';

describe('Root AppRouter & Context Suite', () => {
  after(async () => {
    await closeDatabaseConnection(true);
  });

  describe('Context Resolution', () => {
    it('createTRPCContext should handle unauthenticated requests', async () => {
      const mockReq = { headers: {} } as any;
      const ctx = await createTRPCContext({ req: mockReq } as any);
      assert.strictEqual(ctx.user, null);
      assert.strictEqual(ctx.isStaff, false);
    });

    it('createTRPCContext should identify admin users and set isStaff true', async () => {
      const token = generateAccessToken({
        sub: '00000000-0000-0000-0000-000000000001',
        email: 'admin@store.test',
        userName: 'adminUser',
        role: 'admin',
      });

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      const ctx = await createTRPCContext({ req: mockReq } as any);
      assert.ok(ctx.user);
      assert.strictEqual(ctx.user.role, 'admin');
      assert.strictEqual(ctx.isStaff, true);
    });

    it('createTRPCContext should set isStaff false for regular customers', async () => {
      const token = generateAccessToken({
        sub: '00000000-0000-0000-0000-000000000002',
        email: 'buyer@store.test',
        userName: 'buyerUser',
        role: 'customer',
      });

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      const ctx = await createTRPCContext({ req: mockReq } as any);
      assert.ok(ctx.user);
      assert.strictEqual(ctx.user.role, 'customer');
      assert.strictEqual(ctx.isStaff, false);
    });
  });

  describe('Root Procedures', () => {
    it('health: should return system health status and timestamp', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const health = await caller.health();
      assert.strictEqual(health.status, 'ok');
      assert.ok(health.timestamp);
    });

    it('wishlist.sync: should synchronize wishlist items and return count', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const result = await caller.wishlist.sync({
        productIds: ['prod-1', 'prod-2', 'prod-3'],
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 3);
    });

    it('products routes: should route getAll through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const products = await caller.products.getAll();
      assert.strictEqual(Array.isArray(products), true);
    });

    it('inventory routes: should route getPaginated through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const inv = await caller.inventory.getPaginated({ page: 1, limit: 2 });
      assert.ok(inv);
      assert.strictEqual(Array.isArray(inv.items), true);
    });

    it('reviews routes: should route getAll through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const reviews = await caller.reviews.getAll();
      assert.strictEqual(Array.isArray(reviews), true);
    });

    it('customers routes: should route getAll through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const customers = await caller.customers.getAll();
      assert.strictEqual(Array.isArray(customers), true);
    });

    it('orders routes: should route getAll through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const orders = await caller.orders.getAll();
      assert.strictEqual(Array.isArray(orders), true);
    });

    it('invoices routes: should route getAll through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const invoices = await caller.invoices.getAll();
      assert.strictEqual(Array.isArray(invoices), true);
    });

    it('credits routes: should route getAll through root appRouter with admin context', async () => {
      const adminCaller = appRouter.createCaller({
        user: { role: 'admin', userName: 'admin', email: 'admin@store.test' } as any,
        isStaff: true,
      });
      const credits = await adminCaller.credits.getAll();
      assert.ok(credits);
      assert.strictEqual(Array.isArray(credits.credits), true);
    });

    it('analytics routes: should route getOverview through root appRouter', async () => {
      const caller = appRouter.createCaller({ user: null, isStaff: false });
      const overview = await caller.analytics.getOverview();
      assert.ok(overview);
      assert.strictEqual(typeof overview.views, 'number');
      assert.strictEqual(typeof overview.whatsappClicks, 'number');
      assert.strictEqual(typeof overview.instagramClicks, 'number');
      assert.strictEqual(typeof overview.conversionRate, 'number');
    });
  });
});
