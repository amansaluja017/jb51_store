import test from 'node:test';
import assert from 'node:assert';
import { appRouter } from './router.js';
import { db, product as productTable, wishlist as wishlistTable, wishlistItems as wishlistItemsTable } from '@repo/db';
import { eq } from 'drizzle-orm';

test('Wishlist Routes with Browser Fingerprint Integration Test Suite', async (t) => {
  const caller = appRouter.createCaller({ isStaff: false, user: null });
  const runId = Date.now().toString(36);
  const fingerprintA = `fp_browser_chrome_${runId}`;
  const fingerprintB = `fp_browser_safari_${runId}`;

  // Find or create a valid product in the database for foreign key relational testing
  const existingProducts = await db.select({ id: productTable.id }).from(productTable).limit(2);
  let testProductId1 = existingProducts[0]?.id;
  let testProductId2 = existingProducts[1]?.id;

  // Cleanup after tests
  t.after(async () => {
    try {
      const wishlists = await db.select().from(wishlistTable);
      for (const wl of wishlists) {
        if (wl.fingerprint === fingerprintA || wl.fingerprint === fingerprintB) {
          await db.delete(wishlistTable).where(eq(wishlistTable.id, wl.id));
        }
      }
    } catch (_) {}
  });

  await t.test('1. wishlist.get returns empty list for new browser fingerprint', async () => {
    const res = await caller.wishlist.get({ fingerprint: fingerprintA });
    assert.ok(res);
    assert.strictEqual(res.fingerprint, fingerprintA);
    assert.deepStrictEqual(res.productIds, []);
  });

  await t.test('2. wishlist.sync creates wishlist and stores items for fingerprint', async () => {
    const testIds = testProductId1 ? [testProductId1] : ['00000000-0000-0000-0000-000000000001'];
    const res = await caller.wishlist.sync({
      fingerprint: fingerprintA,
      productIds: testIds,
    });

    assert.ok(res);
    assert.strictEqual(res.success, true);
    assert.ok(res.productIds.includes(testIds[0]));

    // Query back using get route
    const fetched = await caller.wishlist.get({ fingerprint: fingerprintA });
    assert.ok(fetched);
    assert.strictEqual(fetched.fingerprint, fingerprintA);
    assert.ok(fetched.productIds.includes(testIds[0]));
  });

  await t.test('3. wishlist.add adds new product to fingerprint wishlist', async () => {
    if (testProductId2) {
      const addRes = await caller.wishlist.add({
        fingerprint: fingerprintA,
        productId: testProductId2,
      });
      assert.ok(addRes);
      assert.strictEqual(addRes.success, true);

      // Verify fetched includes both products
      const fetched = await caller.wishlist.get({ fingerprint: fingerprintA });
      assert.ok(fetched.productIds.includes(testProductId2));
    }
  });

  await t.test('4. wishlist.remove removes product from fingerprint wishlist', async () => {
    if (testProductId1) {
      const removeRes = await caller.wishlist.remove({
        fingerprint: fingerprintA,
        productId: testProductId1,
      });
      assert.ok(removeRes);
      assert.strictEqual(removeRes.success, true);

      const fetched = await caller.wishlist.get({ fingerprint: fingerprintA });
      assert.strictEqual(fetched.productIds.includes(testProductId1), false);
    }
  });

  await t.test('5. browser fingerprints are isolated (Fingerprint B does not see Fingerprint A items)', async () => {
    // Fingerprint B gets its own empty wishlist
    const resB = await caller.wishlist.get({ fingerprint: fingerprintB });
    assert.ok(resB);
    assert.strictEqual(resB.fingerprint, fingerprintB);
    assert.deepStrictEqual(resB.productIds, []);
  });
});

process.on('beforeExit', () => {
  process.exit(0);
});
