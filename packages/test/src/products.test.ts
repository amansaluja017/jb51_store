import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, product as productTable, productImages as productImagesTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { productsRouter } from '@repo/products/router';
import {
  adminContext,
  customerContext,
  unauthContext,
  generateValidDescription,
  generateUniqueSlug,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Products Router and Controller Suite', () => {
  const createdSlugs: string[] = [];
  const testImages = [
    'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
  ];

  after(async () => {
    try {
      for (const slug of createdSlugs) {
        const rows = await db.select().from(productTable);
        const matches = rows.filter((p: any) => {
          const feat = (p.features as Record<string, any>) || {};
          return feat.slug === slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug;
        });
        for (const m of matches) {
          await db.delete(productImagesTable).where(eq(productImagesTable.productId, m.id));
          await db.delete(productTable).where(eq(productTable.id, m.id));
        }
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  describe('Public Product Procedures', () => {
    it('getAll: should retrieve products list for storefront', async () => {
      const caller = productsRouter.createCaller(unauthContext);
      const result = await caller.getAll();
      assert.strictEqual(Array.isArray(result), true);
    });

    it('getPaginated: should retrieve paginated products with default settings', async () => {
      const caller = productsRouter.createCaller(unauthContext);
      const result = await caller.getPaginated({ page: 1, limit: 4 });
      assert.ok(result);
      assert.strictEqual(Array.isArray(result.items), true);
      assert.ok(typeof result.totalPages === 'number');
    });

    it('getCategories: should fetch available categories', async () => {
      const caller = productsRouter.createCaller(unauthContext);
      const categories = await caller.getCategories();
      assert.strictEqual(Array.isArray(categories), true);
    });
  });

  describe('Product Lifecycle and Admin Procedures', () => {
    const slug = generateUniqueSlug('royal-suit');
    createdSlugs.push(slug);

    it('create: should reject non-admin users with UNAUTHORIZED or FORBIDDEN', async () => {
      const unauthCaller = productsRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.create({
            name: 'Unauthorized Suit',
            slug: 'unauth-suit',
            description: generateValidDescription(105),
            category: 'Suits',
            images: testImages,
            variants: [{ color: 'Navy', stock: 5 }],
            price: 5000,
          });
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );

      const customerCaller = productsRouter.createCaller(customerContext);
      await assert.rejects(
        async () => {
          await customerCaller.create({
            name: 'Customer Suit',
            slug: 'cust-suit',
            description: generateValidDescription(105),
            category: 'Suits',
            images: testImages,
            variants: [{ color: 'Navy', stock: 5 }],
            price: 5000,
          });
        },
        (err: any) => err.code === 'FORBIDDEN'
      );
    });

    it('create: should validate description word count requirement (>= 100 words)', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      await assert.rejects(
        async () => {
          await adminCaller.create({
            name: 'Short Description Suit',
            slug: 'short-desc-suit',
            description: 'Too short description with only seven words.',
            category: 'Suits',
            images: testImages,
            variants: [{ color: 'Navy', stock: 5 }],
            price: 5000,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'BAD_REQUEST');
          assert.match(err.message, /at least 100 words/i);
          return true;
        }
      );
    });

    it('create: should successfully create product listing by admin', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const created = await adminCaller.create({
        name: 'Royal Heritage Suit',
        slug,
        description: generateValidDescription(110),
        category: 'Festive Wear',
        mrp: 14999,
        sellingPrice: 11999,
        price: 11999,
        images: testImages,
        variants: [
          { color: 'Burgundy', hexCode: '#800020', stock: 8 },
          { color: 'Gold', hexCode: '#FFD700', stock: 4 },
        ],
      });

      assert.ok(created);
      assert.strictEqual(created.slug, slug);
      assert.strictEqual(created.name, 'Royal Heritage Suit');
      assert.strictEqual(created.images.length, 2);
    });

    it('getBySlug: should fetch product details by slug', async () => {
      const unauthCaller = productsRouter.createCaller(unauthContext);
      const product = await unauthCaller.getBySlug({ slug });

      assert.ok(product);
      assert.strictEqual(product?.slug, slug);
      assert.strictEqual(product?.name, 'Royal Heritage Suit');
    });

    it('update: should allow admin to update product details', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const updated = await adminCaller.update({
        slug,
        data: {
          name: 'Royal Heritage Silk Suit Updated',
          sellingPrice: 10999,
          price: 10999,
        },
      });

      assert.ok(updated);
      assert.strictEqual(updated?.name, 'Royal Heritage Silk Suit Updated');
      assert.strictEqual(updated?.price, 10999);
    });

    it('updateStatus and getStatus: should control storefront visibility', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const unauthCaller = productsRouter.createCaller(unauthContext);

      // Update to unListed
      const statusUpdated = await adminCaller.updateStatus({
        slug,
        status: 'unListed',
        inStock: true,
      });
      assert.ok(statusUpdated);
      assert.strictEqual(statusUpdated?.status, 'unListed');

      // Admin can view unlisted product status
      const adminStatus = await adminCaller.getStatus({ slug });
      assert.ok(adminStatus);
      assert.strictEqual(adminStatus?.status, 'unListed');

      // Public / non-admin caller receives null for unlisted product
      const publicStatus = await unauthCaller.getStatus({ slug });
      assert.strictEqual(publicStatus, null);
    });

    it('reorderImages: should allow admin to update image order', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const reversedImages = [testImages[1], testImages[0]];
      const result = await adminCaller.reorderImages({
        slug,
        images: reversedImages,
      });

      assert.strictEqual(result.success, true);
    });

    it('delete: should allow admin to delete product listing', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const unauthCaller = productsRouter.createCaller(unauthContext);

      const deleted = await adminCaller.delete({ slug });
      assert.strictEqual(deleted, true);

      // Confirm product no longer exists
      const fetched = await unauthCaller.getBySlug({ slug });
      assert.strictEqual(fetched, null);
    });
  });
});
