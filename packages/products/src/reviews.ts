import {
  db,
  reviews as reviewsTable,
} from '@repo/db';
import { desc, eq } from 'drizzle-orm';

export interface CreateReviewInput {
  name: string;
  message: string;
  stars: number;
  image?: string | null;
  video?: string | null;
  instagramId?: string | null;
  phone?: string | null;
  location?: string | null;
  email?: string | null;
  approved?: boolean;
}

export interface ReviewItem {
  id: string;
  name: string;
  message: string;
  stars: number;
  image: string | null;
  video: string | null;
  instagramId: string | null;
  phone: string | null;
  location: string | null;
  email?: string | null;
  approved: boolean;
  createdAt: string;
}

export async function getReviews(filterApproved?: boolean): Promise<ReviewItem[]> {
  const query = db
    .select({
      id: reviewsTable.id,
      customerName: reviewsTable.customerName,
      phoneNumber: reviewsTable.phoneNumber,
      email: reviewsTable.email,
      review: reviewsTable.review,
      rating: reviewsTable.rating,
      imageUrls: reviewsTable.imageUrls,
      videoUrl: reviewsTable.videoUrl,
      location: reviewsTable.location,
      instagramId: reviewsTable.instagramId,
      approved: reviewsTable.approved,
      createdAt: reviewsTable.createdAt,
    })
    .from(reviewsTable);

  const rows = filterApproved !== undefined
    ? await query.where(eq(reviewsTable.approved, filterApproved)).orderBy(desc(reviewsTable.createdAt))
    : await query.orderBy(desc(reviewsTable.createdAt));

  return rows.map((r) => ({
    id: r.id,
    name: r.customerName || 'Anonymous',
    message: r.review || '',
    stars: r.rating ? Math.round(Number(r.rating)) : 5,
    image: Array.isArray(r.imageUrls) && r.imageUrls.length > 0 ? r.imageUrls[0] : null,
    video: r.videoUrl || null,
    instagramId: r.instagramId || null,
    phone: r.phoneNumber || null,
    location: r.location || null,
    email: r.email || null,
    approved: !!r.approved,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));
}

export async function createReview(input: CreateReviewInput): Promise<ReviewItem> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Customer name is required');
  }

  const message = input.message.trim();
  if (!message) {
    throw new Error('Review message is required');
  }

  const imageUrls = input.image ? [input.image] : [];
  const ratingValue = Math.min(Math.max(input.stars || 5, 1), 5);

  const [created] = await db
    .insert(reviewsTable)
    .values({
      customerName: name,
      phoneNumber: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      review: message,
      rating: String(ratingValue),
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
      videoUrl: input.video?.trim() || null,
      location: input.location?.trim() || null,
      instagramId: input.instagramId?.trim() || null,
      approved: input.approved !== undefined ? input.approved : false,
    })
    .returning();

  return {
    id: created.id,
    name: created.customerName || 'Anonymous',
    message: created.review || '',
    stars: created.rating ? Math.round(Number(created.rating)) : 5,
    image: Array.isArray(created.imageUrls) && created.imageUrls.length > 0 ? created.imageUrls[0] : null,
    video: created.videoUrl || null,
    instagramId: created.instagramId || null,
    phone: created.phoneNumber || null,
    location: created.location || null,
    email: created.email || null,
    approved: !!created.approved,
    createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
  };
}

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function updateReview(
  id: string,
  data: { approved?: boolean; rating?: number; review?: string }
): Promise<ReviewItem | null> {
  if (!id || !isUuid(id)) return null;

  const updatePayload: Record<string, any> = {};
  if (data.approved !== undefined) updatePayload.approved = data.approved;
  if (data.rating !== undefined) updatePayload.rating = String(data.rating);
  if (data.review !== undefined) updatePayload.review = data.review;

  const [updated] = await db
    .update(reviewsTable)
    .set(updatePayload)
    .where(eq(reviewsTable.id, id))
    .returning();

  if (!updated) return null;

  return {
    id: updated.id,
    name: updated.customerName || 'Anonymous',
    message: updated.review || '',
    stars: updated.rating ? Math.round(Number(updated.rating)) : 5,
    image: Array.isArray(updated.imageUrls) && updated.imageUrls.length > 0 ? updated.imageUrls[0] : null,
    video: updated.videoUrl || null,
    instagramId: updated.instagramId || null,
    phone: updated.phoneNumber || null,
    location: updated.location || null,
    email: updated.email || null,
    approved: !!updated.approved,
    createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!id || !isUuid(id)) return false;

  const deleted = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, id))
    .returning({ id: reviewsTable.id });

  return deleted.length > 0;
}
