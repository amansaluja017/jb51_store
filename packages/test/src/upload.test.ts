import test, { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import express, { Express } from 'express';
import { Server } from 'http';
import uploadRouter from '../../../apps/api/src/routes/upload.js';
import {
  extractPublicIdFromUrl,
  isCloudinaryConfigured,
} from '../../../apps/api/src/services/cloudinary.js';
import { closeDatabaseConnection } from './helpers/test-context.js';

describe('Upload and Media REST Routes Suite', () => {
  let app: Express;
  let server: Server;
  let baseUrl: string;

  before(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get(['/', '/health'], (_req, res) => {
      res.json({
        status: 'ok',
        service: 'JB51 Store API',
      });
    });

    // Mount upload router
    const routerMiddleware = (uploadRouter as any).default || uploadRouter;
    app.use('/api', routerMiddleware);

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
    await closeDatabaseConnection(true);
  });

  describe('Cloudinary Helper Functions', () => {
    it('isCloudinaryConfigured should return a boolean', () => {
      const configured = isCloudinaryConfigured();
      assert.strictEqual(typeof configured, 'boolean');
    });

    it('extractPublicIdFromUrl should extract clean public ID from standard URLs', () => {
      const urlWithVersion = 'https://res.cloudinary.com/demo/image/upload/v1725900000/jb51_store/products/suit_item.jpg';
      assert.strictEqual(extractPublicIdFromUrl(urlWithVersion), 'jb51_store/products/suit_item');

      const urlWithoutVersion = 'https://res.cloudinary.com/demo/image/upload/jb51_store/products/suit_item2.png';
      assert.strictEqual(extractPublicIdFromUrl(urlWithoutVersion), 'jb51_store/products/suit_item2');

      const urlWithQuery = 'https://res.cloudinary.com/demo/image/upload/v12345/jb51_store/products/suit_item3.webp?q=auto';
      assert.strictEqual(extractPublicIdFromUrl(urlWithQuery), 'jb51_store/products/suit_item3');

      // Invalid non-cloudinary URL
      assert.strictEqual(extractPublicIdFromUrl('https://example.com/photo.jpg'), null);
    });
  });

  describe('REST Endpoints Integration', () => {
    it('GET /health: should return 200 ok status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json() as any;
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(data.service, 'JB51 Store API');
    });

    it('POST /api/upload: should return 400 when no file is uploaded', async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json() as any;
      assert.match(data.error, /no image file provided/i);
    });

    it('POST /api/upload/multiple: should return 400 when no files provided', async () => {
      const res = await fetch(`${baseUrl}/api/upload/multiple`, {
        method: 'POST',
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json() as any;
      assert.match(data.error, /no image files provided/i);
    });

    it('GET /api/products/:productId/images: should return 200 and image list', async () => {
      const dummyId = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(`${baseUrl}/api/products/${dummyId}/images`);
      assert.strictEqual(res.status, 200);
      const data = await res.json() as any;
      assert.strictEqual(data.success, true);
      assert.strictEqual(Array.isArray(data.images), true);
    });

    it('DELETE /api/upload: should return 400 when target is missing', async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: 'DELETE',
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json() as any;
      assert.match(data.error, /please provide url or publicId/i);
    });

    it('PATCH /api/products/images/reorder: should return 400 on invalid body', async () => {
      const res = await fetch(`${baseUrl}/api/products/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json() as any;
      assert.ok(data.error);
    });
  });
});
