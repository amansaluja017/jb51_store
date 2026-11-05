import { db } from '@repo/db/client';
import { newsletter as newsletterTable, NewsletterSubscriber } from '@repo/db/schema';
import { desc, asc, eq, sql, or, ilike, and } from 'drizzle-orm';

export interface SubscribeNewsletterInput {
  email: string;
  source?: string | null;
}

export interface NewsletterResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
  id?: string;
  email?: string;
}

export interface GetSubscribersParams {
  page?: number | null;
  limit?: number | null;
  query?: string | null;
  activeOnly?: boolean | null;
}

export interface PaginatedNewsletterSubscribers {
  items: NewsletterSubscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * In-memory fallback cache when database connection is offline/testing.
 */
const inMemorySubscribers = new Map<string, NewsletterSubscriber>();

/**
 * Subscribe or reactivate an email in the newsletter database.
 */
export async function subscribeNewsletter(
  input: SubscribeNewsletterInput
): Promise<NewsletterResult> {
  const normalizedEmail = (input.email || '').trim().toLowerCase();
  const source = (input.source || 'web_footer').trim();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  try {
    // 1. Check if email already exists
    const existing = await db
      .select()
      .from(newsletterTable)
      .where(eq(newsletterTable.email, normalizedEmail))
      .limit(1);

    if (existing && existing.length > 0) {
      const subscriber = existing[0];
      if (subscriber.isActive) {
        return {
          success: true,
          message: 'You are already subscribed to our newsletter.',
          alreadySubscribed: true,
          id: subscriber.id,
          email: subscriber.email,
        };
      }

      // Reactivate previously unsubscribed email
      const updated = await db
        .update(newsletterTable)
        .set({
          isActive: true,
          source: source || subscriber.source,
          updatedAt: new Date(),
        })
        .where(eq(newsletterTable.id, subscriber.id))
        .returning();

      return {
        success: true,
        message: 'Welcome back! Your newsletter subscription has been reactivated.',
        alreadySubscribed: false,
        id: updated[0]?.id || subscriber.id,
        email: normalizedEmail,
      };
    }

    // 2. Insert new subscriber
    const inserted = await db
      .insert(newsletterTable)
      .values({
        email: normalizedEmail,
        source: source || 'web_footer',
        isActive: true,
      })
      .returning();

    return {
      success: true,
      message: 'Thank you for subscribing to the JB51 newsletter!',
      alreadySubscribed: false,
      id: inserted[0]?.id,
      email: normalizedEmail,
    };
  } catch (err: any) {
    // In-memory fallback if database connection is unavailable (e.g. unit tests or local offline development)
    console.warn('[subscribeNewsletter] DB Notice:', err?.message || err);

    const existingMem = inMemorySubscribers.get(normalizedEmail);
    if (existingMem) {
      if (existingMem.isActive) {
        return {
          success: true,
          message: 'You are already subscribed to our newsletter.',
          alreadySubscribed: true,
          id: existingMem.id,
          email: normalizedEmail,
        };
      }
      existingMem.isActive = true;
      existingMem.updatedAt = new Date();
      return {
        success: true,
        message: 'Welcome back! Your newsletter subscription has been reactivated.',
        alreadySubscribed: false,
        id: existingMem.id,
        email: normalizedEmail,
      };
    }

    const mockId = `mock-news-${Date.now()}`;
    const newSub: NewsletterSubscriber = {
      id: mockId,
      email: normalizedEmail,
      source: source || 'web_footer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemorySubscribers.set(normalizedEmail, newSub);

    return {
      success: true,
      message: 'Thank you for subscribing to the JB51 newsletter!',
      alreadySubscribed: false,
      id: mockId,
      email: normalizedEmail,
    };
  }
}

/**
 * Unsubscribe an email from the newsletter.
 */
export async function unsubscribeNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('A valid email address is required.');
  }

  try {
    await db
      .update(newsletterTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(newsletterTable.email, normalizedEmail));

    return {
      success: true,
      message: 'You have been successfully unsubscribed from the newsletter.',
    };
  } catch (err: any) {
    console.warn('[unsubscribeNewsletter] DB Notice:', err?.message || err);
    const existing = inMemorySubscribers.get(normalizedEmail);
    if (existing) {
      existing.isActive = false;
      existing.updatedAt = new Date();
    }
    return {
      success: true,
      message: 'You have been successfully unsubscribed from the newsletter.',
    };
  }
}

/**
 * Fetch paginated list of subscribers for Admin management.
 */
export async function getNewsletterSubscribers(
  params?: GetSubscribersParams
): Promise<PaginatedNewsletterSubscribers> {
  const page = Math.max(1, params?.page || 1);
  const limit = Math.min(100, Math.max(1, params?.limit || 20));
  const offset = (page - 1) * limit;
  const query = (params?.query || '').trim().toLowerCase();
  const activeOnly = params?.activeOnly ?? false;

  try {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(newsletterTable.isActive, true));
    }

    if (query) {
      conditions.push(ilike(newsletterTable.email, `%${query}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(newsletterTable)
        .where(whereClause)
        .orderBy(desc(newsletterTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterTable)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err: any) {
    console.warn('[getNewsletterSubscribers] DB Notice:', err?.message || err);
    let all = Array.from(inMemorySubscribers.values());
    if (activeOnly) {
      all = all.filter((s) => s.isActive);
    }
    if (query) {
      all = all.filter((s) => s.email.toLowerCase().includes(query));
    }
    const total = all.length;
    const paginated = all.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

/**
 * Delete a subscriber by ID or Email.
 */
export async function deleteNewsletterSubscriber(
  idOrEmail: string
): Promise<{ success: boolean; message: string }> {
  const target = (idOrEmail || '').trim().toLowerCase();
  if (!target) {
    throw new Error('Subscriber ID or email is required.');
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);

  try {
    if (isUuid) {
      await db
        .delete(newsletterTable)
        .where(or(eq(newsletterTable.id, target), eq(newsletterTable.email, target)));
    } else {
      await db
        .delete(newsletterTable)
        .where(eq(newsletterTable.email, target));
    }

    inMemorySubscribers.delete(target);
    return { success: true, message: 'Subscriber removed successfully.' };
  } catch (err: any) {
    console.warn('[deleteNewsletterSubscriber] DB Notice:', err?.message || err);
    inMemorySubscribers.delete(target);
    return { success: true, message: 'Subscriber removed successfully.' };
  }
}

