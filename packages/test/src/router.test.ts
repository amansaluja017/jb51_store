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
  });
});
