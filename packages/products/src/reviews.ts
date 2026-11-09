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
      stars: r.rating ? Number(r.rating) : 5,
      image: Array.isArray(r.imageUrls) && r.imageUrls.length > 0 ? r.imageUrls[0] : null,
      video: r.videoUrl || null,
      instagramId: r.instagramId || null,
      phone: r.phoneNumber || null,
      location: r.location || null,
      email: r.email || null,
      approved: !!r.approved,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch {
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
  const ratingValue = Math.min(Math.max(Number(input.stars) || 5, 0.5), 5);

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
    stars: created.rating ? Number(created.rating) : 5,
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

export interface UpdateReviewInput {
  name?: string;
  message?: string;
  stars?: number;
  image?: string | null;
  video?: string | null;
  instagramId?: string | null;
  phone?: string | null;
  location?: string | null;
  email?: string | null;
  approved?: boolean;
  rating?: number;
  review?: string;
}

export async function updateReview(
  id: string,
  data: UpdateReviewInput
): Promise<ReviewItem | null> {
  if (!id || !isUuid(id)) return null;

  const updatePayload: Record<string, any> = {};
  if (data.approved !== undefined) updatePayload.approved = data.approved;
  if (data.name !== undefined) updatePayload.customerName = data.name.trim();
  if (data.message !== undefined) updatePayload.review = data.message.trim();
  if (data.review !== undefined) updatePayload.review = data.review.trim();
  if (data.stars !== undefined) updatePayload.rating = String(Math.min(Math.max(Number(data.stars), 0.5), 5));
  if (data.rating !== undefined) updatePayload.rating = String(Math.min(Math.max(Number(data.rating), 0.5), 5));
  if (data.image !== undefined) updatePayload.imageUrls = data.image ? [data.image] : null;
  if (data.video !== undefined) updatePayload.videoUrl = data.video?.trim() || null;
  if (data.instagramId !== undefined) updatePayload.instagramId = data.instagramId?.trim() || null;
  if (data.phone !== undefined) updatePayload.phoneNumber = data.phone?.trim() || null;
  if (data.location !== undefined) updatePayload.location = data.location?.trim() || null;
  if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;

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
    stars: updated.rating ? Number(updated.rating) : 5,
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

export async function getReviewCounts(): Promise<{ all: number; approved: number; pending: number }> {
  const fullList = await getReviews();
  const approved = fullList.filter((r) => r.approved).length;
  return {
    all: fullList.length,
    approved,
    pending: fullList.length - approved,
  };
}

export async function getPaginatedReviews(input?: GetPaginatedReviewsInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 10);
  const search = (input?.search || '').trim().toLowerCase();
  const approved = input?.approved;

  const fullList = await getReviews();
  const allCount = fullList.length;
  const approvedCount = fullList.filter((r) => r.approved).length;
  const pendingCount = allCount - approvedCount;

  let all = approved !== null && approved !== undefined
    ? fullList.filter((r) => r.approved === approved)
    : fullList;

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
    counts: {
      all: allCount,
      approved: approvedCount,
      pending: pendingCount,
    },
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
        phone: r.phoneNumber || null,
        location: r.location || null,
        approved: !!r.approved,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
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
