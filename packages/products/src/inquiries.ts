import {
  db,
  inqueries as inqueriesTable,
} from '@repo/db';
import { desc, asc, eq, sql, or, ilike } from 'drizzle-orm';

export interface CreateInquiryInput {
  customerName: string;
  phoneNumber?: string | null;
  email?: string | null;
  message: string;
  inqueryType?: 'general' | 'sales' | 'support' | 'product' | 'other' | null;
  productName?: string | null;
  size?: string | null;
  color?: string | null;
  channel?: string | null;
  status?: 'pending' | 'responded' | 'resolved' | null;
}

export interface InquiryItem {
  id: string;
  customerName: string;
  productName: string;
  size: string;
  color: string;
  channel: string;
  timestamp: string;
  status: 'Pending' | 'Responded' | 'Resolved';
  rawStatus: 'pending' | 'responded' | 'resolved';
  phone?: string;
  email?: string;
  query: string;
  inqueryType?: string | null;
  createdAt: string;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function mapToInquiryItem(row: typeof inqueriesTable.$inferSelect): InquiryItem {
  const rawStatus = (row.status || 'pending').toLowerCase() as 'pending' | 'responded' | 'resolved';
  const displayStatus: 'Pending' | 'Responded' | 'Resolved' =
    rawStatus === 'resolved' ? 'Resolved' : rawStatus === 'responded' ? 'Responded' : 'Pending';

  const defaultProductName = row.inqueryType
    ? `${row.inqueryType.charAt(0).toUpperCase() + row.inqueryType.slice(1)} Inquiry`
    : 'General Inquiry';

  const createdDate = row.createdAt ? new Date(row.createdAt) : new Date();

  return {
    id: row.id,
    customerName: row.customerName || 'Anonymous',
    productName: row.productName || defaultProductName,
    size: row.size || 'Standard',
    color: row.color || 'Default',
    channel: row.channel || 'Web',
    timestamp: formatTimestamp(createdDate),
    status: displayStatus,
    rawStatus,
    phone: row.phoneNumber || undefined,
    email: row.email || undefined,
    query: row.message || '',
    inqueryType: row.inqueryType,
    createdAt: createdDate.toISOString(),
  };
}

export async function getInquiries(filterStatus?: 'pending' | 'responded' | 'resolved'): Promise<InquiryItem[]> {
  try {
    const query = db.select().from(inqueriesTable);
    const rows = filterStatus
      ? await query.where(eq(inqueriesTable.status, filterStatus)).orderBy(desc(inqueriesTable.createdAt))
      : await query.orderBy(desc(inqueriesTable.createdAt));

    return rows.map(mapToInquiryItem);
  } catch (err) {
    console.log('[DB getInquiries Notice]:', err instanceof Error ? err.message : err);
    return [];
  }
}

export interface GetPaginatedInquiriesInput {
  search?: string | null;
  status?: 'all' | 'pending' | 'responded' | 'resolved' | null;
  sortBy?: 'recent' | 'oldest' | 'name-asc' | 'name-desc' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedInquiries(input?: GetPaginatedInquiriesInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 10);
  const search = (input?.search || '').trim().toLowerCase();
  const statusFilter = input?.status && input.status !== 'all' ? input.status.toLowerCase() : null;
  const sortBy = input?.sortBy || 'recent';

  try {
    // 1. Fetch rows with proper sorting: "send the recent first data in the inqery and add the sort option also"
    let orderClause = desc(inqueriesTable.createdAt);
    if (sortBy === 'oldest') {
      orderClause = asc(inqueriesTable.createdAt);
    } else if (sortBy === 'name-asc') {
      orderClause = asc(inqueriesTable.customerName);
    } else if (sortBy === 'name-desc') {
      orderClause = desc(inqueriesTable.customerName);
    }

    let rows = await db.select().from(inqueriesTable).orderBy(orderClause);

    // Compute metrics counts across all items
    const totalCount = rows.length;
    const pendingCount = rows.filter((r) => r.status !== 'resolved').length;
    const resolvedCount = rows.filter((r) => r.status === 'resolved').length;

    // Filter by status if requested
    if (statusFilter) {
      if (statusFilter === 'pending') {
        rows = rows.filter((r) => r.status !== 'resolved');
      } else {
        rows = rows.filter((r) => (r.status || '').toLowerCase() === statusFilter);
      }
    }

    // Filter by search query if provided
    if (search) {
      rows = rows.filter((r) => {
        const name = (r.customerName || '').toLowerCase();
        const msg = (r.message || '').toLowerCase();
        const phone = (r.phoneNumber || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const prod = (r.productName || '').toLowerCase();
        return (
          name.includes(search) ||
          msg.includes(search) ||
          phone.includes(search) ||
          email.includes(search) ||
          prod.includes(search)
        );
      });
    }

    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const paginatedRows = rows.slice(offset, offset + limit);

    return {
      items: paginatedRows.map(mapToInquiryItem),
      total,
      page: safePage,
      limit,
      totalPages,
      pendingCount,
      resolvedCount,
      totalCount,
    };
  } catch (err) {
    console.error('[getPaginatedInquiries Error]:', err);
    return {
      items: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      pendingCount: 0,
      resolvedCount: 0,
      totalCount: 0,
    };
  }
}

export async function createInquiry(input: CreateInquiryInput): Promise<InquiryItem> {
  const customerName = (input.customerName || '').trim();
  if (!customerName) {
    throw new Error('Customer name is required');
  }

  const message = (input.message || '').trim();
  if (!message) {
    throw new Error('Inquiry message is required');
  }

  // Map input inqueryType to valid enum
  let type: 'general' | 'sales' | 'support' | 'product' | 'other' = 'general';
  if (input.inqueryType) {
    const lower = input.inqueryType.toLowerCase();
    if (lower === 'sales') type = 'sales';
    else if (lower === 'support') type = 'support';
    else if (lower === 'product') type = 'product';
    else if (lower === 'other') type = 'other';
    else type = 'general';
  }

  const status: 'pending' | 'responded' | 'resolved' = input.status || 'pending';

  const [created] = await db
    .insert(inqueriesTable)
    .values({
      customerName,
      phoneNumber: input.phoneNumber?.trim() || null,
      email: input.email?.trim() || null,
      message,
      productName: input.productName?.trim() || null,
      size: input.size?.trim() || null,
      color: input.color?.trim() || null,
      channel: input.channel?.trim() || 'Web',
      inqueryType: type,
      status,
    })
    .returning();

  return mapToInquiryItem(created);
}

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function updateInquiryStatus(
  id: string,
  status: 'pending' | 'responded' | 'resolved'
): Promise<InquiryItem | null> {
  if (!id || !isUuid(id)) return null;

  const [updated] = await db
    .update(inqueriesTable)
    .set({ status })
    .where(eq(inqueriesTable.id, id))
    .returning();

  if (!updated) return null;
  return mapToInquiryItem(updated);
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (!id || !isUuid(id)) return false;

  const deleted = await db
    .delete(inqueriesTable)
    .where(eq(inqueriesTable.id, id))
    .returning({ id: inqueriesTable.id });

  return deleted.length > 0;
}

export interface SearchInquiriesInput {
  query?: string | null;
  status?: 'all' | 'pending' | 'responded' | 'resolved' | null;
  limit?: number | null;
}

export async function searchInquiries(input?: SearchInquiriesInput) {
  const query = (input?.query || '').trim();
  const limit = Math.max(1, input?.limit || 20);

  if (query) {
    const pattern = `%${query}%`;
    try {
      const rows = await db
        .select()
        .from(inqueriesTable)
        .where(
          or(
            ilike(inqueriesTable.customerName, pattern),
            ilike(inqueriesTable.phoneNumber, pattern),
            ilike(inqueriesTable.email, pattern),
            ilike(inqueriesTable.message, pattern),
            ilike(inqueriesTable.productName, pattern)
          )
        )
        .orderBy(desc(inqueriesTable.createdAt))
        .limit(limit);

      let filtered = rows;
      if (input?.status && input.status !== 'all') {
        filtered = filtered.filter((r) => (r.status || '').toLowerCase() === input.status!.toLowerCase());
      }

      return {
        items: filtered.map(mapToInquiryItem),
        total: filtered.length,
        query,
      };
    } catch (err) {
      console.warn('[searchInquiries ILIKE DB notice]:', err);
    }
  }

  const result = await getPaginatedInquiries({
    search: query,
    status: input?.status,
    page: 1,
    limit,
  });
  return {
    items: result.items,
    total: result.total,
    query,
  };
}

export interface InquirySuggestionItem {
  id: string;
  customerName: string;
  productName?: string | null;
  messageSnippet: string;
  inqueryType?: string | null;
  status: string;
  similarity?: number;
}

export async function getInquirySuggestions(query: string, limit = 8) {
  const q = (query || '').trim();
  if (!q) {
    return { query: '', suggestions: [] };
  }

  try {
    const rows = await db
      .select({
        id: inqueriesTable.id,
        customerName: inqueriesTable.customerName,
        message: inqueriesTable.message,
        productName: inqueriesTable.productName,
        inqueryType: inqueriesTable.inqueryType,
        status: inqueriesTable.status,
        nameSim: sql<number>`similarity(${inqueriesTable.customerName}, ${q})`,
        msgSim: sql<number>`word_similarity(${q}, ${inqueriesTable.message})`,
        prodSim: sql<number>`word_similarity(${q}, ${inqueriesTable.productName})`,
      })
      .from(inqueriesTable)
      .where(
        or(
          sql`similarity(${inqueriesTable.customerName}, ${q}) > 0.1`,
          sql`word_similarity(${q}, ${inqueriesTable.customerName}) > 0.15`,
          sql`word_similarity(${q}, ${inqueriesTable.message}) > 0.15`,
          sql`word_similarity(${q}, ${inqueriesTable.productName}) > 0.15`
        )
      )
      .orderBy(sql`GREATEST(similarity(${inqueriesTable.customerName}, ${q}), word_similarity(${q}, ${inqueriesTable.customerName}), word_similarity(${q}, ${inqueriesTable.message})) DESC`)
      .limit(limit);

    return {
      query: q,
      suggestions: rows.map((r) => {
        const msg = r.message || '';
        const idx = msg.toLowerCase().indexOf(q.toLowerCase());
        const snippet = idx !== -1
          ? `...${msg.substring(Math.max(0, idx - 15), Math.min(msg.length, idx + q.length + 25)).trim()}...`
          : msg.substring(0, 50);

        return {
          id: r.id,
          customerName: r.customerName || 'Inquirer',
          productName: r.productName,
          messageSnippet: snippet,
          inqueryType: r.inqueryType,
          status: r.status,
          similarity: Math.max(r.nameSim || 0, r.msgSim || 0, r.prodSim || 0),
        };
      }),
    };
  } catch (err) {
    console.warn('[getInquirySuggestions pg_trgm DB notice]:', err);
    return { query: q, suggestions: [] };
  }
}
