import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { client } from '@repo/db';
import { productsRouter } from './router.js';

describe('Products Router API Integration Tests', () => {
  after(async () => {
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

    await adminCaller.create({
      name: 'Emerald Banarasi Suit',
      slug: 'emerald-banarasi-suit',
      price: 24500,
    });

    const product = await unauthCaller.getBySlug({ slug: 'emerald-banarasi-suit' });
    assert.notStrictEqual(product, null);
    assert.strictEqual(product?.slug, 'emerald-banarasi-suit');
  });

  it('3. should reject product creation for unauthenticated or non-admin users', async () => {
    const unauthCaller = productsRouter.createCaller(unauthContext);
    await assert.rejects(
      async () => {
        await unauthCaller.create({
          name: 'Unauthorized Suit',
          slug: 'unauthorized-suit',
          price: 5000,
        });
      },
      (err: any) => err.code === 'UNAUTHORIZED'
    );

    const nonAdminCaller = productsRouter.createCaller(nonAdminContext);
    await assert.rejects(
      async () => {
        await nonAdminCaller.create({
          name: 'Forbidden Suit',
          slug: 'forbidden-suit',
          price: 5000,
        });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );
  });

  it('4. should successfully create a new product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const newProduct = await caller.create({
      name: 'Test Royal Silk Suit',
      slug: 'test-royal-silk-suit',
      description: 'A test royal silk suit for unit testing.',
      price: 29900,
      category: 'Occasion Wear',
      variants: [{ color: 'Royal Blue', size: 'M', stock: 15 }],
      fabric: 'Pure Silk',
      fit: 'Regular',
      careInstructions: 'Dry clean only',
      images: ['https://example.com/test.jpg'],
    });

    assert.strictEqual(newProduct.slug, 'test-royal-silk-suit');
    assert.strictEqual(newProduct.name, 'Test Royal Silk Suit');
    assert.strictEqual(newProduct.price, 29900);
    assert.notStrictEqual(newProduct.id, undefined);
    assert.notStrictEqual(newProduct.createdAt, undefined);
  });

  it('5. should successfully update an existing product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const updatedProduct = await caller.update({
      slug: 'test-royal-silk-suit',
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
    await assert.rejects(
      async () => {
        await nonAdminCaller.update({
          slug: 'test-royal-silk-suit',
          data: { price: 1000 },
        });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );

    await assert.rejects(
      async () => {
        await nonAdminCaller.delete({ slug: 'test-royal-silk-suit' });
      },
      (err: any) => err.code === 'FORBIDDEN'
    );
  });

  it('7. should successfully delete a product when called by admin', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const result = await caller.delete({ slug: 'test-royal-silk-suit' });
    assert.strictEqual(result, true);

    const fetched = await caller.getBySlug({ slug: 'test-royal-silk-suit' });
    assert.strictEqual(fetched, null);
  });

  it('8. should successfully fetch and update product status via status procedures', async () => {
    const adminCaller = productsRouter.createCaller(adminContext);
    const unauthCaller = productsRouter.createCaller(unauthContext);

    await adminCaller.create({
      name: 'Status Test Suit',
      slug: 'status-test-suit',
      price: 15000,
    });

    // Initial status check: listed & inStock = true
    const statusRes = await unauthCaller.getStatus({ slug: 'status-test-suit' });
    assert.notStrictEqual(statusRes, null);
    assert.strictEqual(statusRes?.status, 'listed');
    assert.strictEqual(statusRes?.inStock, true);

    // Unlist product
    const unlistRes = await adminCaller.updateStatus({ slug: 'status-test-suit', status: 'unListed' });
    assert.notStrictEqual(unlistRes, null);
    assert.strictEqual(unlistRes?.status, 'unListed');

    // Toggle inStock to false
    const outOfStockRes = await adminCaller.updateStatus({ slug: 'status-test-suit', inStock: false });
    assert.notStrictEqual(outOfStockRes, null);
    assert.strictEqual(outOfStockRes?.inStock, false);

    // Delete product -> updates status to discontinued
    await adminCaller.delete({ slug: 'status-test-suit' });
    const discontinuedRes = await unauthCaller.getStatus({ slug: 'status-test-suit' });
    assert.strictEqual(discontinuedRes?.status, 'discontinued');
  });
});
