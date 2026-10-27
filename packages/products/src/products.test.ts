import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { client, db, product as productTable, productImages as productImagesTable } from '@repo/db';
import { productsRouter } from './router.js';
import { eq, asc } from 'drizzle-orm';

describe('Products Router API Integration Tests', () => {
  const runId = Date.now().toString(36);
  const createdSlugs: string[] = [];

  const VALID_LONG_DESCRIPTION = 'Handcrafted with meticulous dedication by master artisans, this exquisite ensemble reflects the timeless heritage of traditional Indian royal tailoring. Every single stitch embodies generations of craftsmanship, using only authentic high thread count pure fabrics that drape effortlessly against the silhouette. The intricate hand embroidered motifs, inspired by classical architecture and royal heritage gardens, feature delicate zardozi, shimmering gota patti, and fine threadwork accents. Designed specifically for celebratory occasions, festive soirées, and grand family milestones, this garment balances contemporary elegance with rich royal cultural heritage. Complete with tailored comfort, bespoke finishing, and luxurious accents, it offers unmatched sophistication for the modern connoisseur of bespoke occasion wear.';

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
      description: VALID_LONG_DESCRIPTION,
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
          description: VALID_LONG_DESCRIPTION,
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
          description: VALID_LONG_DESCRIPTION,
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
      description: VALID_LONG_DESCRIPTION,
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
    assert.strictEqual(updatedProduct?.name, 'Test Royal Silk Suit');
    assert.strictEqual(updatedProduct?.category, 'Occasion Wear');
    assert.strictEqual(updatedProduct!.images!.length, 2);
    assert.strictEqual(updatedProduct!.variants!.length, 1);
    assert.strictEqual(updatedProduct!.variants![0].stock, 15);
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
      description: VALID_LONG_DESCRIPTION,
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
          description: VALID_LONG_DESCRIPTION,
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
          description: VALID_LONG_DESCRIPTION,
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
      description: VALID_LONG_DESCRIPTION,
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
    assert.strictEqual(created.variants!.length, 2);
    assert.strictEqual(created.images!.length, 2);
    assert.strictEqual(created.inStock, true);

    // Verify retrieval includes populated relational data
    const retrieved = await caller.getBySlug({ slug });
    assert.notStrictEqual(retrieved, null);
    assert.strictEqual(retrieved?.category, 'Anarkali Suits');
    assert.strictEqual(retrieved!.variants!.length, 2);
    assert.strictEqual(retrieved!.images!.length >= 2, true);
  });

  it('11. should update product name, pricing, specs, tags, and visibility without altering variants or inventory', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('atomic-transaction-suit');

    // Update product specs, pricing, and visibility
    const updated = await caller.update({
      slug,
      data: {
        name: 'Atomic Transaction Suit Premium',
        price: 21999,
        fabric: 'Pure Georgette',
        fit: 'Royal Flared Fit',
        careInstructions: 'Dry Clean Only',
        tags: ['silk', 'royal', 'flared'],
        isListed: true,
      },
    });

    assert.notStrictEqual(updated, null);
    assert.strictEqual(updated?.name, 'Atomic Transaction Suit Premium');
    assert.strictEqual(updated?.price, 21999);
    assert.strictEqual(updated?.fabric, 'Pure Georgette');
    assert.strictEqual(updated?.fit, 'Royal Flared Fit');
    assert.strictEqual(updated?.careInstructions, 'Dry Clean Only');
    // Existing variants and stock remain intact
    assert.strictEqual(updated!.variants!.length, 2);
    assert.strictEqual(updated!.variants!.some(v => v.color === 'Emerald Green' && v.stock === 12), true);
    assert.strictEqual(updated!.variants!.some(v => v.color === 'Ruby Red' && v.stock === 8), true);

    // Verify via getBySlug query
    const fetched = await caller.getBySlug({ slug });
    assert.notStrictEqual(fetched, null);
    assert.strictEqual(fetched?.name, 'Atomic Transaction Suit Premium');
    assert.strictEqual(fetched?.price, 21999);
    assert.strictEqual(fetched!.variants!.length, 2);
  });

  it('12. should update orderIndex and preserve image IDs when calling reorderImages route', async () => {
    const caller = productsRouter.createCaller(adminContext);
    const slug = getRunSlug('image-reorder-test-suit');

    const created = await caller.create({
      name: 'Image Reorder Test Suit',
      slug,
      description: VALID_LONG_DESCRIPTION,
      price: 25000,
      category: 'Festive Wear',
      images: [
        'https://example.com/reorder-img1.jpg',
        'https://example.com/reorder-img2.jpg',
        'https://example.com/reorder-img3.jpg',
      ],
      variants: [{ color: 'Navy Blue', stock: 10 }],
    });

    assert.notStrictEqual(created, null);
    const productId = created.id;

    // Fetch initial image records directly from DB
    const initialImages = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(asc(productImagesTable.orderIndex));

    assert.strictEqual(initialImages.length, 3);
    const img1Initial = initialImages.find(img => img.url === 'https://example.com/reorder-img1.jpg')!;
    const img2Initial = initialImages.find(img => img.url === 'https://example.com/reorder-img2.jpg')!;
    const img3Initial = initialImages.find(img => img.url === 'https://example.com/reorder-img3.jpg')!;

    assert.strictEqual(img1Initial.orderIndex, 0);
    assert.strictEqual(img2Initial.orderIndex, 1);
    assert.strictEqual(img3Initial.orderIndex, 2);

    // Hit the dedicated reorderImages route to swap position 0 and 2: [img3, img2, img1]
    const reorderResult = await caller.reorderImages({
      slug,
      images: [
        'https://example.com/reorder-img3.jpg',
        'https://example.com/reorder-img2.jpg',
        'https://example.com/reorder-img1.jpg',
      ],
    });

    assert.notStrictEqual(reorderResult, null);
    assert.strictEqual(reorderResult.success, true);
    assert.deepStrictEqual(reorderResult.images, [
      'https://example.com/reorder-img3.jpg',
      'https://example.com/reorder-img2.jpg',
      'https://example.com/reorder-img1.jpg',
    ]);

    // Inspect DB records: The row IDs must be IDENTICAL (not dropped and recreated)
    const afterReorderImages = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(asc(productImagesTable.orderIndex));

    assert.strictEqual(afterReorderImages.length, 3);
    const img1After = afterReorderImages.find(img => img.url === 'https://example.com/reorder-img1.jpg')!;
    const img2After = afterReorderImages.find(img => img.url === 'https://example.com/reorder-img2.jpg')!;
    const img3After = afterReorderImages.find(img => img.url === 'https://example.com/reorder-img3.jpg')!;

    // IDs are preserved
    assert.strictEqual(img1After.id, img1Initial.id);
    assert.strictEqual(img2After.id, img2Initial.id);
    assert.strictEqual(img3After.id, img3Initial.id);

    // orderIndex reflects new order
    assert.strictEqual(img3After.orderIndex, 0);
    assert.strictEqual(img2After.orderIndex, 1);
    assert.strictEqual(img1After.orderIndex, 2);

    // Verify getBySlug orders them by the new orderIndex
    const fetched = await caller.getBySlug({ slug });
    assert.deepStrictEqual(fetched?.images, [
      'https://example.com/reorder-img3.jpg',
      'https://example.com/reorder-img2.jpg',
      'https://example.com/reorder-img1.jpg',
    ]);
  });
});
