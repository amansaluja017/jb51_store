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

  it('update: should allow editing review content, rating, and details', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const reviewId = createdReviewIds[0];

    const updated = await adminCaller.update({
      id: reviewId,
      name: 'Edited Reviewer Name',
      message: 'Updated review message with high praise for custom tailoring.',
      stars: 4,
      location: 'Bangalore',
      phone: '+91 99999 88888',
      email: 'edited@example.com',
    });

    assert.ok(updated);
    assert.strictEqual(updated?.name, 'Edited Reviewer Name');
    assert.strictEqual(updated?.message, 'Updated review message with high praise for custom tailoring.');
    assert.strictEqual(updated?.stars, 4);
    assert.strictEqual(updated?.location, 'Bangalore');
    assert.strictEqual(updated?.phone, '+91 99999 88888');
    assert.strictEqual(updated?.email, 'edited@example.com');
  });

  it('decimal ratings: should support creating and updating reviews with decimal stars like 2.5 and 3.5', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const review = await adminCaller.create({
      name: 'Decimal Rating Reviewer',
      message: 'Good overall, fitting was slightly snug.',
      stars: 2.5,
      location: 'Pune',
      approved: true,
    });

    assert.ok(review);
    assert.ok(review.id);
    createdReviewIds.push(review.id);
    assert.strictEqual(review.stars, 2.5, 'Created review must preserve 2.5 rating');

    const updated = await adminCaller.update({
      id: review.id,
      stars: 3.5,
      message: 'After alterations, fit is much better now!',
    });

    assert.ok(updated);
    assert.strictEqual(updated?.stars, 3.5, 'Updated review must preserve 3.5 rating');
  });

  it('update: non-existent review returns null', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const result = await adminCaller.update({
      id: '00000000-0000-0000-0000-000000000000',
      approved: true,
    });
    assert.strictEqual(result, null);
  });

  it('getPaginated: should retrieve paginated reviews with breakdown counts', async () => {
    const caller = reviewsRouter.createCaller(unauthContext);
    const result = await caller.getPaginated({ page: 1, limit: 5 });
    assert.ok(result);
    assert.strictEqual(Array.isArray(result.items), true);
    assert.strictEqual(typeof result.total, 'number');
    assert.strictEqual(typeof result.page, 'number');
    assert.ok(result.counts);
    assert.strictEqual(typeof result.counts.all, 'number');
    assert.strictEqual(typeof result.counts.approved, 'number');
    assert.strictEqual(typeof result.counts.pending, 'number');
    assert.strictEqual(result.counts.all, result.counts.approved + result.counts.pending);
  });

  it('getCounts: should retrieve review counts breakdown', async () => {
    const caller = reviewsRouter.createCaller(unauthContext);
    const counts = await caller.getCounts();
    assert.ok(counts);
    assert.strictEqual(typeof counts.all, 'number');
    assert.strictEqual(typeof counts.approved, 'number');
    assert.strictEqual(typeof counts.pending, 'number');
    assert.strictEqual(counts.all, counts.approved + counts.pending);
  });

  it('search: should search reviews by query', async () => {
    const caller = reviewsRouter.createCaller(unauthContext);
    const result = await caller.search({ query: 'suit' });
    assert.ok(result);
    assert.strictEqual(Array.isArray(result.items), true);
    assert.strictEqual(typeof result.total, 'number');
  });

  it('suggestions: should return autocomplete suggestions', async () => {
    const caller = reviewsRouter.createCaller(unauthContext);
    const result = await caller.suggestions({ query: 'suit', limit: 5 });
    assert.ok(result);
    assert.strictEqual(Array.isArray(result.suggestions), true);
  });

  it('delete: should delete a review', async () => {
    const adminCaller = reviewsRouter.createCaller(adminContext);
    const reviewId = createdReviewIds.pop();
    if (!reviewId) return;

    const deleted = await adminCaller.delete({ id: reviewId });
    assert.strictEqual(deleted, true);
  });
});
