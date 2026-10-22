import test, { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import express, { Express } from 'express';
import { Server } from 'http';
import {
  createRateLimiter,
  globalRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  trpcRateLimiter,
} from '@repo/rate-limiting';

describe('Rate Limiting Middleware Suite', () => {
  let app: Express;
  let server: Server;
  let baseUrl: string;

  before(async () => {
    app = express();

    // Create a strict test limiter allowing only 2 requests
    const strictLimiter = createRateLimiter({
      windowMs: 10000,
      max: 2,
      message: { status: 429, error: 'Limit exceeded for testing' },
    });

    app.get('/test-limit', strictLimiter, (_req, res) => {
      res.json({ ok: true });
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('predefined limiters should be functions', () => {
    assert.strictEqual(typeof globalRateLimiter, 'function');
    assert.strictEqual(typeof authRateLimiter, 'function');
    assert.strictEqual(typeof uploadRateLimiter, 'function');
    assert.strictEqual(typeof trpcRateLimiter, 'function');
  });

  it('should enforce rate limits and return 429 when threshold exceeded', async () => {
    // Request 1: allowed
    const res1 = await fetch(`${baseUrl}/test-limit`);
    assert.strictEqual(res1.status, 200);

    // Request 2: allowed
    const res2 = await fetch(`${baseUrl}/test-limit`);
    assert.strictEqual(res2.status, 200);

    // Request 3: blocked with 429
    const res3 = await fetch(`${baseUrl}/test-limit`);
    assert.strictEqual(res3.status, 429);
    const data = await res3.json() as any;
    assert.strictEqual(data.error, 'Limit exceeded for testing');
  });
});
