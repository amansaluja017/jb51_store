import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, product as productTable, productVariant as productVariantTable, inventryTransaction as inventryTransactionTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { inventoryRouter, productsRouter } from '@repo/products/router';
import {
  adminContext,
  customerContext,
  unauthContext,
  generateValidDescription,
  generateUniqueSlug,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Inventory Router and Controller Suite', () => {
  let createdProductId: string | null = null;
  let createdVariantId: string | null = null;
  const slug = generateUniqueSlug('inventory-test-suit');

  after(async () => {
    try {
      if (createdProductId) {
        await db.delete(inventryTransactionTable).where(eq(inventryTransactionTable.productId, createdProductId));
        await db.delete(productVariantTable).where(eq(productVariantTable.productId, createdProductId));
        await db.delete(productTable).where(eq(productTable.id, createdProductId));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  describe('Inventory Queries and Pagination', () => {
    it('getPaginated: should retrieve paginated inventory with filters', async () => {
      const caller = inventoryRouter.createCaller(unauthContext);
      const result = await caller.getPaginated({
        page: 1,
        limit: 5,
        stockFilter: 'all',
      });

      assert.ok(result);
      assert.strictEqual(Array.isArray(result.items), true);
      assert.ok(typeof result.total === 'number');
      assert.ok(typeof result.totalPages === 'number');
    });

    it('getTransactions: should retrieve recent inventory transactions', async () => {
      const caller = inventoryRouter.createCaller(unauthContext);
      const transactions = await caller.getTransactions({ limit: 10 });
      assert.strictEqual(Array.isArray(transactions), true);
    });
  });

  describe('Inventory Transactions Recording', () => {
    it('setup: create test product with initial variant stock', async () => {
      const adminCaller = productsRouter.createCaller(adminContext);
      const created = await adminCaller.create({
        name: 'Inventory Test Suit',
        slug,
        description: generateValidDescription(105),
        category: 'Test Category',
        price: 8999,
        images: [
          'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
          'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
        ],
        variants: [
          { color: 'Teal', stock: 20 },
        ],
      });

      assert.ok(created);
      createdProductId = created.id;
      createdVariantId = created.variants[0]?.id || null;
    });

    it('recordTransaction: should reject unauthenticated caller', async () => {
      const unauthCaller = inventoryRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.recordTransaction({
            productId: createdProductId!,
            type: 'sale',
            quantity: 2,
            name: 'Walk-in Buyer',
          });
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );
    });

    it('recordTransaction: should record a valid sale transaction', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const uniqueTimestamp = Date.now();
      const result = await adminCaller.recordTransaction({
        productId: createdProductId!,
        productVariantId: createdVariantId,
        type: 'sale',
        quantity: 3,
        name: `Aarav Sharma ${uniqueTimestamp}`,
        phoneNumber: `+9197${Math.floor(10000000 + Math.random() * 90000000)}`,
        unitPrice: 8999,
        totalAmount: 26997,
        notes: 'Walk-in boutique sale',
      });

      assert.ok(result);
      assert.strictEqual(result.type, 'sale');
      assert.strictEqual(result.quantity, 3);
      assert.strictEqual(result.partyName, `Aarav Sharma ${uniqueTimestamp}`);
    });

    it('recordTransaction: should record a valid purchase/restock transaction', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const result = await adminCaller.recordTransaction({
        productId: createdProductId!,
        productVariantId: createdVariantId,
        type: 'purchase',
        quantity: 10,
        name: 'Varanasi Weavers Co.',
        phoneNumber: '+919811223344',
        unitPrice: 5000,
        totalAmount: 50000,
        notes: 'Workshop batch replenishment',
      });

      assert.ok(result);
      assert.strictEqual(result.type, 'purchase');
      assert.strictEqual(result.quantity, 10);
    });

    it('update: should reject unauthenticated caller', async () => {
      const unauthCaller = inventoryRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.update({
            productId: createdProductId!,
            variants: [{ id: createdVariantId, stock: 25 }],
          });
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );
    });

    it('update: admin can update variant stock and verify inStock status', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const updateRes = await adminCaller.update({
        productId: createdProductId!,
        variants: [
          { id: createdVariantId, color: 'Teal', stock: 45, reservedStock: 2 },
        ],
        forceInStock: true,
      });

      assert.ok(updateRes);
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.totalStock, 45);
      assert.strictEqual(updateRes.inStock, true);
    });

    it('updateStock: admin can use updateStock alias with slug', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const updateRes = await adminCaller.updateStock({
        slug,
        variants: [
          { color: 'Teal', stock: 12 },
        ],
      });

      assert.ok(updateRes);
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.totalStock, 12);
      assert.strictEqual(updateRes.inStock, true);
    });

    it('update: changing inventory stock to 0 changes product inStock status to false', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const updateRes = await adminCaller.update({
        productId: createdProductId!,
        variants: [
          { id: createdVariantId, color: 'Teal', stock: 0 },
        ],
      });

      assert.ok(updateRes);
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.totalStock, 0);
      assert.strictEqual(updateRes.inStock, false);

      // Verify product query returns inStock false
      const productQueryCaller = productsRouter.createCaller(unauthContext);
      const prod = await productQueryCaller.getBySlug({ slug });
      assert.ok(prod);
      assert.strictEqual((prod as any).inStock, false);
    });

    it('update: changing inventory stock from 0 to >0 changes product inStock status back to true', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);
      const updateRes = await adminCaller.update({
        slug,
        variants: [
          { id: createdVariantId, color: 'Teal', stock: 25 },
        ],
      });

      assert.ok(updateRes);
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.totalStock, 25);
      assert.strictEqual(updateRes.inStock, true);

      // Verify product query returns inStock true
      const productQueryCaller = productsRouter.createCaller(unauthContext);
      const prod = await productQueryCaller.getBySlug({ slug });
      assert.ok(prod);
      assert.strictEqual((prod as any).inStock, true);
    });

    it('update: master toggle forceInStock updates product status even without variant changes', async () => {
      const adminCaller = inventoryRouter.createCaller(adminContext);

      // Toggle off
      const toggleOffRes = await adminCaller.update({
        slug,
        forceInStock: false,
      });
      assert.strictEqual(toggleOffRes.success, true);
      assert.strictEqual(toggleOffRes.inStock, false);

      let prod = await productsRouter.createCaller(unauthContext).getBySlug({ slug });
      assert.strictEqual((prod as any).inStock, false);

      // Toggle on
      const toggleOnRes = await adminCaller.update({
        slug,
        forceInStock: true,
      });
      assert.strictEqual(toggleOnRes.success, true);
      assert.strictEqual(toggleOnRes.inStock, true);

      prod = await productsRouter.createCaller(unauthContext).getBySlug({ slug });
      assert.strictEqual((prod as any).inStock, true);
    });
  });
});
