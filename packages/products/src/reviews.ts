import {
  db,
  reviews as reviewsTable,
} from '@repo/db';
import { desc, eq, or, and, ilike, sql } from 'drizzle-orm';

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
  try {
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
  } catch (err) {
    console.log('[DB getReviews Notice]:', err instanceof Error ? err.message : err);
    return [];
  }
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

export interface GetPaginatedReviewsInput {
  search?: string | null;
  approved?: boolean | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedReviews(input?: GetPaginatedReviewsInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 10);
  const search = (input?.search || '').trim().toLowerCase();
  const approved = input?.approved;

  let all = await getReviews(approved !== null && approved !== undefined ? approved : undefined);

  if (search) {
    all = all.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const msg = (r.message || '').toLowerCase();
      const loc = (r.location || '').toLowerCase();
      return name.includes(search) || msg.includes(search) || loc.includes(search);
    });
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const items = all.slice(offset, offset + limit);

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

export interface SearchReviewsInput {
  query?: string | null;
  approved?: boolean | null;
  limit?: number | null;
}

export async function searchReviews(input?: SearchReviewsInput) {
  const query = (input?.query || '').trim();
  const limit = Math.max(1, input?.limit || 20);

  if (query) {
    const pattern = `%${query}%`;
    try {
      const dbMatched = await db
        .select()
        .from(reviewsTable)
        .where(
          and(
            input?.approved !== undefined && input?.approved !== null
              ? eq(reviewsTable.approved, input.approved)
              : undefined,
            or(
              ilike(reviewsTable.customerName, pattern),
              ilike(reviewsTable.review, pattern),
              ilike(reviewsTable.location, pattern),
              ilike(reviewsTable.instagramId, pattern)
            )
          )
        )
        .orderBy(desc(reviewsTable.createdAt))
        .limit(limit);

      const items = dbMatched.map((r) => ({
        id: r.id,
        name: r.customerName || 'Anonymous',
        message: r.review || '',
        stars: Number(r.rating) || 5,
        rating: Number(r.rating) || 5,
        image: Array.isArray(r.imageUrls) && r.imageUrls.length > 0 ? r.imageUrls[0] : null,
        video: r.videoUrl || null,
        instagramId: r.instagramId || null,
        location: r.location || null,
        approved: r.approved,
        date: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));

      return {
        items,
        total: items.length,
        query,
      };
    } catch (err) {
      console.warn('[searchReviews ILIKE DB notice]:', err);
    }
  }

  const result = await getPaginatedReviews({
    search: query,
    approved: input?.approved,
    page: 1,
    limit,
  });
  return {
    items: result.items,
    total: result.total,
    query,
  };
}

export interface ReviewSuggestionItem {
  id: string;
  name: string;
  messageSnippet: string;
  rating: number;
  location?: string | null;
  similarity?: number;
}

export async function getReviewSuggestions(query: string, limit = 8) {
  const q = (query || '').trim();
  if (!q) {
    return { query: '', suggestions: [] };
  }

  try {
    const rows = await db
      .select({
        id: reviewsTable.id,
        customerName: reviewsTable.customerName,
        review: reviewsTable.review,
        rating: reviewsTable.rating,
        location: reviewsTable.location,
        nameSim: sql<number>`similarity(${reviewsTable.customerName}, ${q})`,
        reviewSim: sql<number>`word_similarity(${q}, ${reviewsTable.review})`,
      })
      .from(reviewsTable)
      .where(
        or(
          sql`similarity(${reviewsTable.customerName}, ${q}) > 0.1`,
          sql`word_similarity(${q}, ${reviewsTable.customerName}) > 0.15`,
          sql`word_similarity(${q}, ${reviewsTable.review}) > 0.15`
        )
      )
      .orderBy(sql`GREATEST(similarity(${reviewsTable.customerName}, ${q}), word_similarity(${q}, ${reviewsTable.review})) DESC`)
      .limit(limit);

    return {
      query: q,
      suggestions: rows.map((r) => {
        const msg = r.review || '';
        const idx = msg.toLowerCase().indexOf(q.toLowerCase());
        const snippet = idx !== -1
          ? `...${msg.substring(Math.max(0, idx - 15), Math.min(msg.length, idx + q.length + 25)).trim()}...`
          : msg.substring(0, 50);

        return {
          id: r.id,
          name: r.customerName || 'Anonymous',
          messageSnippet: snippet,
          rating: Number(r.rating) || 5,
          location: r.location,
          similarity: Math.max(r.nameSim || 0, r.reviewSim || 0),
        };
      }),
    };
  } catch (err) {
    console.warn('[getReviewSuggestions pg_trgm DB notice]:', err);
    return { query: q, suggestions: [] };
  }
}
