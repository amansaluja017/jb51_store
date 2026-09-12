import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { client, db, product as productTable } from '@repo/db';
import { productsRouter } from './router.js';
import { eq } from 'drizzle-orm';

describe('Products Router API Integration Tests', () => {
  const runId = Date.now().toString(36);
  const createdSlugs: string[] = [];

  const getRunSlug = (base: string) => {
    const slug = `${base}-${runId}`;
    if (!createdSlugs.includes(slug)) {
      createdSlugs.push(slug);
    }
    return slug;
  };

  after(async () => {
    try {
      for (const slug of createdSlugs) {
        const products = await db.select().from(productTable);
        const toDelete = products.filter((p: any) => {
          const feat = (p.features as Record<string, any>) || {};
          return feat.slug === slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug;
        });
        for (const prodRow of toDelete) {
          await db.delete(productTable).where(eq(productTable.id, prodRow.id));
        }
      }
    } catch (_) {}
    try {
      await client.end();
    } catch (_) {}
  });

  const adminContext = {
    user: { id: 'admin-1', role: 'admin', userName: 'adminUser' },
    isStaff: false,
  };

  const nonAdminContext = {
    user: { id: 'user-1', role: 'customer', userName: 'regularUser' },
    isStaff: false,
  };

  const unauthContext = {
    user: null,
    isStaff: false,
  };

  it('1. should fetch all products via getAll query', async () => {
    const caller = productsRouter.createCaller(unauthContext);
    const products = await caller.getAll();
    assert.strictEqual(Array.isArray(products), true);
  });

  it('2. should fetch a single product by slug via getBySlug query', async () => {
    const adminCaller = productsRouter.createCaller(adminContext);
    const unauthCaller = productsRouter.createCaller(unauthContext);
    const slug = getRunSlug('emerald-banarasi-suit');

    await adminCaller.create({
      name: 'Emerald Banarasi Suit',
      slug,
      description: 'Handcrafted banarasi silk suit',
      category: 'Anarkali Suits',
      images: ['https://example.com/eb1.jpg', 'https://example.com/eb2.jpg'],
      variants: [{ color: 'Emerald Green', stock: 10 }],
      price: 24500,
    });

    const product = await unauthCaller.getBySlug({ slug });
    assert.notStrictEqual(product, null);
    assert.strictEqual(product?.slug, slug);
  });

  it('3. should reject product creation for unauthenticated or non-admin users', async () => {
    const unauthCaller = productsRouter.createCaller(unauthContext);
    const unauthSlug = `${'unauthorized-suit'}-${runId}`;
    await assert.rejects(
      async () => {
        await unauthCaller.create({
          name: 'Unauthorized Suit',
          slug: unauthSlug,
          description: 'A suit created without auth',
          category: 'Formal Suits',
          images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          variants: [{ color: 'Blue', stock: 10 }],
          price: 5000,
        });
      },
      (err: any) => err.code === 'UNAUTHORIZED'
    );

    const nonAdminCaller = productsRouter.createCaller(nonAdminContext);
    const forbiddenSlug = `${'forbidden-suit'}-${runId}`;
    await assert.rejects(
      async () => {
        await nonAdminCaller.create({
          name: 'Forbidden Suit',
          slug: forbiddenSlug,
          description: 'A forbidden suit',
          category: 'Formal Suits',
          images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          variants: [{ color: 'Red', stock: 5 }],
          price: 5000,
        });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );
  });

  it('4. should successfully create a new product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('test-royal-silk-suit');
    const newProduct = await caller.create({
      name: 'Test Royal Silk Suit',
      slug,
      description: 'A test royal silk suit for unit testing.',
      price: 29900,
      category: 'Occasion Wear',
      variants: [{ color: 'Royal Blue', stock: 15 }],
      fabric: 'Pure Silk',
      fit: 'Regular',
      careInstructions: 'Dry clean only',
      images: ['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
    });

    assert.strictEqual(newProduct.slug, slug);
    assert.strictEqual(newProduct.name, 'Test Royal Silk Suit');
    assert.strictEqual(newProduct.price, 29900);
    assert.notStrictEqual(newProduct.id, undefined);
    assert.notStrictEqual(newProduct.createdAt, undefined);
  });

  it('5. should successfully update an existing product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('test-royal-silk-suit');
    const updatedProduct = await caller.update({
      slug,
      data: {
        price: 34900,
        isListed: false,
      },
    });

    assert.notStrictEqual(updatedProduct, null);
    assert.strictEqual(updatedProduct?.price, 34900);
    assert.strictEqual(updatedProduct?.isListed, false);
  });

  it('6. should reject product update and delete for non-admin users', async () => {
    const nonAdminCaller = productsRouter.createCaller(nonAdminContext);
    const slug = getRunSlug('test-royal-silk-suit');
    await assert.rejects(
      async () => {
        await nonAdminCaller.update({
          slug,
          data: { price: 1000 },
        });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );

    await assert.rejects(
      async () => {
        await nonAdminCaller.delete({ slug });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );
  });

  it('7. should successfully delete a product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('test-royal-silk-suit');
    const result = await caller.delete({ slug });
    assert.strictEqual(result, true);

    const fetched = await caller.getBySlug({ slug });
    assert.strictEqual(fetched, null);
  });

  it('8. should successfully fetch and update product status via status procedures', async () => {
    const adminCaller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('status-test-suit');

    await adminCaller.create({
      name: 'Status Test Suit',
      slug,
      description: 'Status test suit description',
      category: 'Formal Suits',
      images: ['https://example.com/s1.jpg', 'https://example.com/s2.jpg'],
      variants: [{ color: 'Black', stock: 10 }],
      price: 15000,
    });

    // Initial status check: listed & inStock = true
    const statusRes = await adminCaller.getStatus({ slug });
    assert.notStrictEqual(statusRes, null);
    assert.strictEqual(statusRes?.status, 'listed');
    assert.strictEqual(statusRes?.inStock, true);

    // Unlist product
    const unlistRes = await adminCaller.updateStatus({ slug, status: 'unListed' });
    assert.notStrictEqual(unlistRes, null);
    assert.strictEqual(unlistRes?.status, 'unListed');

    // Toggle inStock to false
    const outOfStockRes = await adminCaller.updateStatus({ slug, inStock: false });
    assert.notStrictEqual(outOfStockRes, null);
    assert.strictEqual(outOfStockRes?.inStock, false);

    // Delete product -> updates status to discontinued
    await adminCaller.delete({ slug });
    const discontinuedRes = await adminCaller.getStatus({ slug });
    assert.strictEqual(discontinuedRes?.status, 'discontinued');
  });

  it('9. should reject product creation when mandatory fields (description, category, images < 2, stock) are invalid', async () => {
    const caller = productsRouter.createCaller(adminContext);

    // Test missing description
    await assert.rejects(
      async () => {
        await caller.create({
          name: 'Missing Desc',
          slug: getRunSlug('missing-desc'),
          description: '',
          price: 1000,
          category: 'Formal Suits',
          images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          variants: [{ color: 'Black', stock: 5 }],
        });
      },
      (err: any) => err.code === 'BAD_REQUEST'
    );

    // Test images < 2
    await assert.rejects(
      async () => {
        await caller.create({
          name: 'One Image',
          slug: getRunSlug('one-image'),
          description: 'Valid description',
          price: 1000,
          category: 'Formal Suits',
          images: ['https://example.com/1.jpg'],
          variants: [{ color: 'Black', stock: 5 }],
        });
      },
      (err: any) => err.code === 'BAD_REQUEST'
    );

    // Test missing variants / stock
    await assert.rejects(
      async () => {
        await caller.create({
          name: 'No Variants',
          slug: getRunSlug('no-variants'),
          description: 'Valid description',
          price: 1000,
          category: 'Formal Suits',
          images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          variants: [],
        });
      },
      (err: any) => err.code === 'BAD_REQUEST'
    );
  });

  it('10. should create product, variants, images, status, and inventry in atomic transaction', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('atomic-transaction-suit');

    const created = await caller.create({
      name: 'Atomic Transaction Suit',
      slug,
      description: 'Verifying complete multi-table transaction insertion',
      price: 19999,
      category: 'Anarkali Suits',
      images: [
        'https://example.com/atomic1.jpg',
        'https://example.com/atomic2.jpg'
      ],
      variants: [
        { color: 'Emerald Green', stock: 12, reservedStock: 2 },
        { color: 'Ruby Red', stock: 8, reservedStock: 0 }
      ],
    });

    assert.strictEqual(created.slug, slug);
    assert.strictEqual(created.variants.length, 2);
    assert.strictEqual(created.images.length, 2);
    assert.strictEqual(created.inStock, true);

    // Verify retrieval includes populated relational data
    const retrieved = await caller.getBySlug({ slug });
    assert.notStrictEqual(retrieved, null);
    assert.strictEqual(retrieved?.category, 'Anarkali Suits');
    assert.strictEqual(retrieved?.variants.length, 2);
    assert.strictEqual(retrieved?.images.length >= 2, true);
  });
});
