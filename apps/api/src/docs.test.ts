import test from 'node:test';
import assert from 'node:assert';
import { createApp } from './app.js';
import { generateOpenApiDocument } from '@repo/docs';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Server } from 'node:http';

test('Scalar OpenAPI Automatic Documentation Integration Tests', async (t) => {
  const app = createApp();
  let server: Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('1. GET /docs serves interactive Scalar API reference UI HTML', async () => {
    const res = await fetch(`${baseUrl}/docs`);
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/html'), `Expected HTML content-type, got ${contentType}`);

    const html = await res.text();
    assert.ok(html.includes('Scalar') || html.includes('scalar'), 'Expected Scalar reference in HTML');
    assert.ok(html.includes('<!doctype html>'), 'Expected valid HTML document');
  });

  await t.test('2. GET /docs/openapi.json serves automatically generated OpenAPI 3.1.0 specification', async () => {
    const res = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/json'), `Expected JSON content-type, got ${contentType}`);

    const spec = (await res.json()) as any;
    assert.strictEqual(spec.openapi, '3.1.0');
    assert.strictEqual(spec.info.title, 'JB51 Store API');

    // Automatically generated tRPC procedures from appRouter
    assert.ok(spec.paths['/trpc/health'], 'Expected /trpc/health path');
    assert.ok(spec.paths['/trpc/auth.login'], 'Expected /trpc/auth.login path');
    assert.ok(spec.paths['/trpc/auth.register'], 'Expected /trpc/auth.register path');
    assert.ok(spec.paths['/trpc/products.getAll'], 'Expected /trpc/products.getAll path');
    assert.ok(spec.paths['/trpc/products.getPaginated'], 'Expected /trpc/products.getPaginated path');
    assert.ok(spec.paths['/trpc/orders.create'], 'Expected /trpc/orders.create path');
    assert.ok(spec.paths['/trpc/invoices.getPaginated'], 'Expected /trpc/invoices.getPaginated path');
    assert.ok(spec.paths['/trpc/credits.getPaginated'], 'Expected /trpc/credits.getPaginated path');
    assert.ok(spec.paths['/trpc/analytics.getOverview'], 'Expected /trpc/analytics.getOverview path');
    assert.ok(spec.paths['/trpc/inquiries.create'], 'Expected /trpc/inquiries.create path');
    assert.ok(spec.paths['/trpc/wishlist.sync'], 'Expected /trpc/wishlist.sync path');
    assert.ok(spec.paths['/trpc/siteConfig.get'], 'Expected /trpc/siteConfig.get path');

    // Verify automatically detected tags
    const tagNames = spec.tags.map((t: { name: string }) => t.name);
    assert.ok(tagNames.includes('Auth'), 'Expected Auth tag');
    assert.ok(tagNames.includes('Products'), 'Expected Products tag');
    assert.ok(tagNames.includes('Orders'), 'Expected Orders tag');

    // REST endpoints
    assert.ok(spec.paths['/health'], 'Expected /health path');
    assert.ok(spec.paths['/api/upload'], 'Expected /api/upload path');
  });

  await t.test('3. New procedures are AUTOMATICALLY documented when added to a router', async () => {
    const trpc = initTRPC.create();

    // Emulate adding a new procedure to a router
    const dynamicRouter = trpc.router({
      promotions: trpc.router({
        applyCoupon: trpc.procedure
          .meta({ description: 'Apply a discount promo code to shopping cart' })
          .input(
            z.object({
              couponCode: z.string().min(3),
              cartTotal: z.number().positive(),
            })
          )
          .mutation(async () => ({ discount: 500, finalTotal: 4500 })),
        getActiveCoupons: trpc.procedure
          .meta({ description: 'Retrieve list of active seasonal promotional coupons' })
          .query(async () => [{ code: 'FESTIVE50', percentage: 10 }]),
      }),
    });

    // Generate OpenAPI document dynamically from the router
    const doc = generateOpenApiDocument({ router: dynamicRouter });

    // Assert that the new procedures are automatically documented
    assert.ok(doc.paths['/trpc/promotions.applyCoupon'], 'Expected newly added mutation to be documented');
    assert.ok(doc.paths['/trpc/promotions.getActiveCoupons'], 'Expected newly added query to be documented');

    const postOp = doc.paths['/trpc/promotions.applyCoupon'].post;
    assert.strictEqual(postOp.summary, 'Apply Coupon');
    assert.strictEqual(postOp.description, 'Apply a discount promo code to shopping cart');
    assert.ok(postOp.tags?.includes('Promotions'), 'Expected automatically created Promotions tag');
    assert.ok(postOp.requestBody?.content['application/json'].schema, 'Expected input schema in requestBody');

    const getOp = doc.paths['/trpc/promotions.getActiveCoupons'].get;
    assert.strictEqual(getOp.summary, 'Get Active Coupons');
    assert.strictEqual(getOp.description, 'Retrieve list of active seasonal promotional coupons');
    assert.ok(getOp.tags?.includes('Promotions'));
  });

  await t.test('4. GET /openapi.json redirects to /docs/openapi.json', async () => {
    const res = await fetch(`${baseUrl}/openapi.json`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/docs/openapi.json');
  });

  await t.test('5. GET /reference redirects to /docs', async () => {
    const res = await fetch(`${baseUrl}/reference`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/docs');
  });
});
