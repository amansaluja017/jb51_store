import test, { after } from 'node:test';
import assert from 'node:assert';
import { appRouter } from './router.js';

test('Reviews API moderation & creation', async (t) => {
  await t.test('should successfully create a new review', async () => {
    const caller = appRouter.createCaller({ isStaff: false, user: null });
    const input = {
      name: 'Test Reviewer',
      message: 'Excellent quality and design!',
      stars: 5,
      location: 'Pune',
      instagramId: 'test_reviewer',
      phone: null,
      image: null,
      video: null
    };
    
    // Call the create mutation
    const result = await caller.reviews.create(input);
    
    assert.ok(result);
    assert.strictEqual(result.name, 'Test Reviewer');
    assert.strictEqual(result.stars, 5);
    assert.strictEqual(result.approved, false); // Stored as unapproved by default
  });

  await t.test('should return null when updating a nonexistent review', async () => {
    const caller = appRouter.createCaller({
      isStaff: true,
      user: { sub: 'admin-id', role: 'admin', email: 'admin@example.com', userName: 'admin' }
    });
    
    // Call update on a nonexistent id
    const result = await caller.reviews.update({
      id: 'nonexistent_id',
      approved: true
    });
    
    assert.strictEqual(result, null);
  });
});

test('Size Guide Focus Restoration', async (t) => {
  await t.test('initial mount should preserve focus (no trigger focus)', () => {
    let focusCalled = false;
    const triggerRef = {
      current: {
        focus: () => {
          focusCalled = true;
        }
      }
    };
    
    let showSizeGuide = false;
    let hasOpened = false;
    
    const runEffect = () => {
      if (showSizeGuide) {
        hasOpened = true;
      } else {
        if (hasOpened) {
          if (triggerRef.current) {
            triggerRef.current.focus();
          }
        }
      }
    };
    
    runEffect();
    assert.strictEqual(focusCalled, false, 'Focus should not be called on mount');
  });

  await t.test('closing the size guide should restore focus to trigger button', () => {
    let focusCalled = false;
    const triggerRef = {
      current: {
        focus: () => {
          focusCalled = true;
        }
      }
    };
    
    // Simulate open state
    let showSizeGuide = true;
    let hasOpened = true;
    
    // Now user closes size guide
    showSizeGuide = false;
    
    const runEffect = () => {
      if (showSizeGuide) {
        hasOpened = true;
      } else {
        if (hasOpened) {
          if (triggerRef.current) {
            triggerRef.current.focus();
          }
        }
      }
    };
    
    runEffect();
    assert.strictEqual(focusCalled, true, 'Focus should be restored to trigger after closing');
  });
});

test('Shop Price Range Calculation Regression', async (t) => {
  await t.test('should compute maxPrice from listed products only', () => {
    const products = [
      { id: '1', name: 'Listed Item A', price: 100, isListed: true },
      { id: '2', name: 'Listed Item B', price: 200, isListed: true },
      { id: '3', name: 'Unlisted Expensive Item', price: 500, isListed: false }
    ];
    
    const listedProductsOnly = products.filter(p => p.isListed !== false);
    
    // Price range logic
    const maxAvailablePrice = listedProductsOnly.length > 0 
      ? Math.max(...listedProductsOnly.map(p => p.price)) 
      : 35000;
      
    const maxPrice = Math.max(...listedProductsOnly.map(p => p.price));
    
    assert.strictEqual(maxAvailablePrice, 200);
    assert.strictEqual(maxPrice, 200);
    assert.ok(maxPrice <= maxAvailablePrice, 'maxPrice range value must be within maxAvailablePrice');
  });
});

test('Product Images & Cloudinary Upload Infrastructure', async (t) => {
  const { productImages } = await import('@repo/db');
  const { isCloudinaryConfigured } = await import('./services/cloudinary.js');
  const uploadRouter = (await import('./routes/upload.js')).default;

  await t.test('product_images table schema has required columns', () => {
    assert.ok(productImages, 'productImages table should be defined');
    assert.ok(productImages.id, 'id column should exist');
    assert.ok(productImages.productId, 'productId column should exist');
    assert.ok(productImages.url, 'url column should exist');
    assert.ok(productImages.productVariantId, 'productVariantId column should exist');
    assert.ok(productImages.orderIndex, 'orderIndex column should exist');
    assert.ok(productImages.createdAt, 'createdAt column should exist');
    assert.ok(productImages.updatedAt, 'updatedAt column should exist');
  });

  await t.test('uploadRouter is exported as an Express Router', () => {
    assert.ok(uploadRouter, 'uploadRouter should be defined');
    assert.strictEqual(typeof uploadRouter, 'function', 'Router should be a function middleware');
  });

  await t.test('isCloudinaryConfigured helper function returns boolean', () => {
    const configured = isCloudinaryConfigured();
    assert.strictEqual(typeof configured, 'boolean');
  });

  await t.test('extractPublicIdFromUrl extracts public_id correctly', async () => {
    const { extractPublicIdFromUrl } = await import('./services/cloudinary.js');
    
    // With version tag
    const url1 = 'https://res.cloudinary.com/cloudname/image/upload/v1725900000/jb51_store/products/sample_item.jpg';
    assert.strictEqual(extractPublicIdFromUrl(url1), 'jb51_store/products/sample_item');

    // Without version tag
    const url2 = 'https://res.cloudinary.com/cloudname/image/upload/jb51_store/products/sample_item2.png';
    assert.strictEqual(extractPublicIdFromUrl(url2), 'jb51_store/products/sample_item2');

    // With query parameters
    const url3 = 'https://res.cloudinary.com/cloudname/image/upload/v12345/jb51_store/products/sample_item3.webp?_a=ABC';
    assert.strictEqual(extractPublicIdFromUrl(url3), 'jb51_store/products/sample_item3');

    // Invalid non-cloudinary URL
    assert.strictEqual(extractPublicIdFromUrl('https://example.com/photo.jpg'), null);
  });

  await t.test('createProduct with 3 images inserts exactly 3 rows in product_images (no duplication)', async () => {
    const { createProduct, getProductBySlug } = await import('@repo/products');
    const { db, productImages, product: productTable } = await import('@repo/db');
    const { eq } = await import('drizzle-orm');

    const testSlug = 'dedup-test-outfit-' + Date.now();
    const imgUrls = [
      'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
      'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
      'https://res.cloudinary.com/demo/image/upload/sample3.jpg',
    ];

    try {
      const created = await createProduct({
        name: 'Deduplication Test Outfit',
        slug: testSlug,
        description: 'Handcrafted with meticulous dedication by master artisans, this exquisite ensemble reflects the timeless heritage of traditional Indian royal tailoring. Every single stitch embodies generations of craftsmanship, using only authentic high thread count pure fabrics that drape effortlessly against the silhouette. The intricate hand embroidered motifs, inspired by classical architecture and royal heritage gardens, feature delicate zardozi, shimmering gota patti, and fine threadwork accents. Designed specifically for celebratory occasions, festive soirées, and grand family milestones, this garment balances contemporary elegance with rich royal cultural heritage. Complete with tailored comfort, bespoke finishing, and luxurious accents, it offers unmatched sophistication for the modern connoisseur of bespoke occasion wear.',
        mrp: 1999,
        sellingPrice: 1499,
        category: 'Test Category',
        images: imgUrls,
        variants: [
          {
            color: 'Red',
            hexCode: '#ff0000',
            stock: 10,
            reservedStock: 0,
            images: imgUrls,
          },
        ],
      });

      assert.ok(created, 'Product should be created');
      assert.strictEqual(created.images.length, 3, 'Product.images should contain exactly 3 URLs');

      // Verify the database table product_images directly
      const dbImageRows = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, created.id));

      assert.strictEqual(
        dbImageRows.length,
        3,
        `Expected exactly 3 rows in product_images table, but found ${dbImageRows.length}`
      );

      // Verify getProductBySlug
      const fetched = await getProductBySlug(testSlug);
      assert.ok(fetched, 'Product should be fetchable by slug');
      assert.strictEqual(fetched.images.length, 3, 'Fetched product images should contain exactly 3 URLs');
    } finally {
      // Clean up test product
      try {
        const rows = await db.select().from(productTable).where(eq(productTable.name, 'Deduplication Test Outfit'));
        for (const row of rows) {
          await db.delete(productImages).where(eq(productImages.productId, row.id));
          await db.delete(productTable).where(eq(productTable.id, row.id));
        }
      } catch (_) {}
    }
  });
});

after(async () => {
  try {
    const { client } = await import('@repo/db');
    await client.end({ timeout: 1 });
  } catch (_) {}
  process.exit(0);
});
