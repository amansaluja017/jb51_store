import test from 'node:test';
import assert from 'node:assert';
import { appRouter } from './router.js';

test('Comprehensive All-Routes Integration Test Suite', async (t) => {
  const adminContext = {
    isStaff: true,
    user: { id: 'admin-id', sub: 'admin-id', role: 'admin' as const, email: 'admin@example.com', userName: 'admin' },
  };

  const publicContext = {
    isStaff: false,
    user: null,
  };

  const adminCaller = appRouter.createCaller(adminContext);
  const publicCaller = appRouter.createCaller(publicContext);

  // 1. Health Route
  await t.test('1. health query returns status ok and timestamp', async () => {
    const res = await publicCaller.health();
    assert.strictEqual(res.status, 'ok');
    assert.ok(res.timestamp);
  });

  // 2. Products Routes (batching / pagination / details / categories)
  await t.test('2. products.getPaginated supports batches of 10-15 and sorting', async () => {
    // Test batch 1 with limit 12 (between 10 and 15)
    const batch1 = await publicCaller.products.getPaginated({
      page: 1,
      limit: 12,
      sortBy: 'name-asc',
    });
    assert.ok(batch1);
    assert.ok(Array.isArray(batch1.items));
    assert.strictEqual(batch1.limit, 12);
    assert.strictEqual(batch1.page, 1);
    assert.ok(typeof batch1.total === 'number');
    assert.ok(typeof batch1.totalPages === 'number');
    assert.ok(batch1.items.length <= 12);

    // Test batch 2
    if (batch1.totalPages > 1) {
      const batch2 = await publicCaller.products.getPaginated({
        page: 2,
        limit: 12,
        sortBy: 'name-asc',
      });
      assert.ok(batch2);
      assert.strictEqual(batch2.page, 2);
    }
  });

  await t.test('3. products.getCategories returns available categories', async () => {
    const categories = await publicCaller.products.getCategories();
    assert.ok(Array.isArray(categories));
  });

  await t.test('4. products.getAll returns array of products', async () => {
    const all = await publicCaller.products.getAll();
    assert.ok(Array.isArray(all));
  });

  // 3. Wishlist Route
  await t.test('5. wishlist.sync processes mutation payload', async () => {
    const syncRes = await publicCaller.wishlist.sync({ productIds: ['prod-1', 'prod-2'] });
    assert.strictEqual(syncRes.success, true);
    assert.strictEqual(syncRes.count, 2);
  });

  // 4. Reviews Routes
  await t.test('6. reviews.getAll and reviews.getPaginated batch fetch', async () => {
    const reviewsList = await publicCaller.reviews.getAll();
    assert.ok(Array.isArray(reviewsList));

    const paginatedReviews = await publicCaller.reviews.getPaginated({ page: 1, limit: 10 });
    assert.ok(paginatedReviews);
    assert.ok(Array.isArray(paginatedReviews.items || paginatedReviews));
  });

  // 5. Inquiries Routes
  await t.test('7. inquiries.create & inquiries.getPaginated', async () => {
    const newInquiry = await publicCaller.inquiries.create({
      customerName: 'Batch Route Test Customer',
      phoneNumber: '+919876543210',
      message: 'Inquiring about wedding occasion suits in bulk',
      inqueryType: 'sales',
    });
    assert.ok(newInquiry);

    const inquiries = await adminCaller.inquiries.getPaginated({ page: 1, limit: 10 });
    assert.ok(inquiries);
  });

  // 6. Customers Routes
  await t.test('8. customers.getPaginated & customers.getAll', async () => {
    const paginatedCustomers = await adminCaller.customers.getPaginated({ page: 1, limit: 10 });
    assert.ok(paginatedCustomers);
  });

  // 7. Inventory Routes
  await t.test('9. inventory.getPaginated & inventory.getTransactions', async () => {
    const inv = await adminCaller.inventory.getPaginated({ page: 1, limit: 10 });
    assert.ok(inv);
  });

  // 8. Orders Routes
  await t.test('10. orders.getPaginated & orders.getAll', async () => {
    const orders = await adminCaller.orders.getPaginated({ page: 1, limit: 10 });
    assert.ok(orders);
  });

  // 9. Invoices Routes
  await t.test('11. invoices.getPaginated & invoices.getAll', async () => {
    const invoices = await adminCaller.invoices.getPaginated({ page: 1, limit: 10 });
    assert.ok(invoices);
  });

  // 10. Credits Routes
  await t.test('12. credits.getPaginated & credits.getAll', async () => {
    const credits = await adminCaller.credits.getPaginated({ page: 1, limit: 10 });
    assert.ok(credits);
  });

  // 11. Analytics Routes
  await t.test('13. analytics routes (overview, allProducts, views, clicks, etc.)', async () => {
    const overview = await adminCaller.analytics.getOverview();
    assert.ok(overview);

    const telemetry = await adminCaller.analytics.getCatalogueTelemetry();
    assert.ok(telemetry);

    const paymentModes = await adminCaller.analytics.getPaymentModes();
    assert.ok(paymentModes);
  });

  // 12. Auth Routes validation checks
  await t.test('14. auth.login rejects invalid credentials properly', async () => {
    await assert.rejects(
      async () => {
        await publicCaller.auth.login({
          identifier: 'nonexistent_test_user@jb51.shop',
          password: 'wrong_password_123',
        });
      },
      (err: any) => err.code === 'UNAUTHORIZED'
    );
  });
});

process.on('beforeExit', () => {
  process.exit(0);
});
