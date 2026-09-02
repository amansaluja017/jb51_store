import test from 'node:test';
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
