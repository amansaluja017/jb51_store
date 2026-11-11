import test from 'node:test';
import assert from 'node:assert';
import { createApp } from './app.js';
import { isAllowedOrigin, getEnvOrigins } from './config/cors.js';
import type { Server } from 'node:http';

test('CORS Configuration & Security Headers Test Suite', async (t) => {
  const originalEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...originalEnv };
  });

  await t.test('1. getEnvOrigins parses multiple comma/semicolon delimited origins, quotes, and slashes', () => {
    process.env.CLIENT_URL = 'http://localhost:3000, https://jb51.shop/, "https://www.jb51.shop"';
    process.env.ALLOWED_ORIGINS = 'https://preview.vercel.app; https://*.example.com';

    const origins = getEnvOrigins();
    assert.ok(origins.includes('http://localhost:3000'));
    assert.ok(origins.includes('https://jb51.shop'));
    assert.ok(origins.includes('https://www.jb51.shop'));
    assert.ok(origins.includes('https://preview.vercel.app'));
    assert.ok(origins.includes('https://*.example.com'));
  });

  await t.test('2. isAllowedOrigin allows non-browser requests without origin header', () => {
    assert.strictEqual(isAllowedOrigin(undefined), true);
  });

  await t.test('3. isAllowedOrigin matches exact origins and wildcard patterns', () => {
    process.env.CLIENT_URL = 'http://localhost:3000, https://*.jb51.shop, *.vercel.app';
    assert.strictEqual(isAllowedOrigin('http://localhost:3000'), true);
    assert.strictEqual(isAllowedOrigin('https://jb51.shop'), true);
    assert.strictEqual(isAllowedOrigin('https://sub.jb51.shop'), true);
    assert.strictEqual(isAllowedOrigin('https://preview-feat.vercel.app'), true);
    assert.strictEqual(isAllowedOrigin('https://malicious-site.com'), false);
  });

  await t.test('4. isAllowedOrigin allows any origin when wildcard * is configured', () => {
    process.env.CLIENT_URL = '*';
    assert.strictEqual(isAllowedOrigin('http://localhost:3000'), true);
    assert.strictEqual(isAllowedOrigin('https://any-site.com'), true);
  });

  await t.test('5. Express server correctly handles preflight OPTIONS with tRPC headers and sets CORS headers', async () => {
    process.env.CLIENT_URL = 'https://jb51.shop';
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

    try {
      // Preflight request
      const preflight = await fetch(`${baseUrl}/trpc/health`, {
        method: 'OPTIONS',
        headers: {
          origin: 'https://jb51.shop',
          'access-control-request-method': 'GET',
          'access-control-request-headers': 'content-type, x-trpc-source, trpc-accept, authorization',
        },
      });

      assert.strictEqual(preflight.status, 204);
      assert.strictEqual(preflight.headers.get('access-control-allow-origin'), 'https://jb51.shop');
      assert.strictEqual(preflight.headers.get('access-control-allow-credentials'), 'true');
      assert.ok(preflight.headers.get('access-control-allow-headers')?.includes('trpc-accept'));

      // Health endpoint with Origin
      const health = await fetch(`${baseUrl}/health`, {
        headers: { origin: 'https://jb51.shop' },
      });
      assert.strictEqual(health.status, 200);
      assert.strictEqual(health.headers.get('access-control-allow-origin'), 'https://jb51.shop');
      assert.strictEqual(health.headers.get('cross-origin-resource-policy'), 'cross-origin');
    } finally {
      server!.close();
    }
  });
});

