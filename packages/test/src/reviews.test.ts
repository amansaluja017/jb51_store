import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, reviews as reviewsTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { reviewsRouter } from '@repo/products/router';
import {
  adminContext,
  unauthContext,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Reviews Router and Controller Suite', () => {
  const createdReviewIds: string[] = [];

  after(async () => {
    try {
      for (const id of createdReviewIds) {
        await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  it('getAll: should retrieve reviews list', async () => {
    const caller = reviewsRouter.createCaller(unauthContext);
    const reviews = await caller.getAll();
    assert.strictEqual(Array.isArray(reviews), true);
  });

  it('getModerationQueue: should retrieve moderation queue', async () => {
    const caller = reviewsRouter.createCaller(adminContext);
    const queue = await caller.getModerationQueue();
    assert.strictEqual(Array.isArray(queue), true);
  });

  it('create: public submission defaults to unapproved state', async () => {
    const publicCaller = reviewsRouter.createCaller(unauthContext);
    const review = await publicCaller.create({
      name: 'Customer Reviewer',
      message: 'The suit craftsmanship is extraordinary! Fitting was spot on.',
      stars: 5,
      location: 'Delhi',
      instagramId: 'customer_delhi',
    });

    assert.ok(review);
    assert.ok(review.id);
    createdReviewIds.push(review.id);

    assert.strictEqual(review.name, 'Customer Reviewer');
    assert.strictEqual(review.stars, 5);
    assert.strictEqual(review.approved, false, 'Public review must be unapproved by default');
  });

  it('create: admin submission can be auto-approved', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const review = await adminCaller.create({
      name: 'Curated VIP Client',
      message: 'Verified store purchase with premium packaging.',
      stars: 5,
      location: 'Mumbai',
      approved: true,
    });

    assert.ok(review);
    assert.ok(review.id);
    createdReviewIds.push(review.id);

    assert.strictEqual(review.approved, true);
  });

  it('update: should allow moderating and approving an unapproved review', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const reviewId = createdReviewIds[0];

    const updated = await adminCaller.update({
      id: reviewId,
      approved: true,
    });

    assert.ok(updated);
    assert.strictEqual(updated?.id, reviewId);
    assert.strictEqual(updated?.approved, true);
  });

  it('update: non-existent review returns null', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const result = await adminCaller.update({
      id: '00000000-0000-0000-0000-000000000000',
      approved: true,
    });
    assert.strictEqual(result, null);
  });

  it('delete: should delete a review', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const reviewId = createdReviewIds.pop();
    if (!reviewId) return;

    const deleted = await adminCaller.delete({ id: reviewId });
    assert.strictEqual(deleted, true);
  });
});
