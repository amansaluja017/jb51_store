import {
  db,
  customerDetails as customerDetailsTable,
  user as userTable,
} from '@repo/db';
import { desc, eq, and, or, ilike, sql } from 'drizzle-orm';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CreateCustomerInput {
  name: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
}

export async function getCustomers() {
  const rows = await db
    .select({
      id: customerDetailsTable.id,
      userId: customerDetailsTable.userId,
      name: customerDetailsTable.name,
      nameSlug: customerDetailsTable.nameSlug,
      phoneNumber: customerDetailsTable.phoneNumber,
      email: customerDetailsTable.email,
      address: customerDetailsTable.address,
      createdAt: customerDetailsTable.createdAt,
      updatedAt: customerDetailsTable.updatedAt,
    })
    .from(customerDetailsTable)
    .orderBy(desc(customerDetailsTable.createdAt));

  return rows;
}

export async function createCustomer(input: CreateCustomerInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Customer name is required');
  }

  const phoneNumber = input.phoneNumber?.trim();
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  const nameSlug = generateSlug(name);
  if (!nameSlug) {
    throw new Error('Customer name must contain valid alphanumeric characters');
  }

  const email = input.email?.trim() || null;
  const address = input.address?.trim() || null;

  return await db.transaction(async (tx) => {
    // Check if customer with same nameSlug and phoneNumber already exists
    const [duplicateCustomer] = await tx
      .select()
      .from(customerDetailsTable)
      .where(
        and(
          eq(customerDetailsTable.nameSlug, nameSlug),
          eq(customerDetailsTable.phoneNumber, phoneNumber)
        )
      );

    if (duplicateCustomer) {
      throw new Error('A customer with this name and phone number already exists');
    }

    // Check if user already exists
    let existingUser = null;
    if (email) {
      const [u] = await tx
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));
      existingUser = u;
    }

    let userId = existingUser?.id;

    if (!userId) {
      // Create user record for customer
      const fallbackEmail =
        email ||
        `cust_${Date.now()}_${Math.floor(Math.random() * 10000)}@internal.store`;

      const [newUser] = await tx
        .insert(userTable)
        .values({
          email: fallbackEmail,
          password: 'CUSTOMER_NO_AUTH',
          role: 'customer',
        })
        .returning();

      userId = newUser.id;
    }

    // Insert customer_details
    const [customer] = await tx
      .insert(customerDetailsTable)
      .values({
        userId,
        name,
        nameSlug,
        phoneNumber,
        email,
        address,
      })
      .returning();

    return customer;
  });
}

export interface GetPaginatedCustomersInput {
  search?: string | null;
  sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedCustomers(input?: GetPaginatedCustomersInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 8);
  const search = (input?.search || '').trim().toLowerCase();
  const sortBy = input?.sortBy || 'name-asc';

  let all = await getCustomers();

  if (search) {
    const cleanDigits = search.replace(/\D/g, '');
    const isPhoneSearch = cleanDigits.length >= 10;
    all = all.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const cleanPhoneDigits = (c.phoneNumber || '').replace(/\D/g, '');
      const email = (c.email || '').toLowerCase();
      const address = (c.address || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      return (
        id === search ||
        name.includes(search) ||
        phone.includes(search) ||
        (isPhoneSearch && cleanPhoneDigits === cleanDigits) ||
        email.includes(search) ||
        address.includes(search)
      );
    });
  }

  all.sort((a, b) => {
    const nameA = (a.name || '').trim();
    const nameB = (b.name || '').trim();
    if (sortBy === 'name-asc') {
      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    }
    if (sortBy === 'name-desc') {
      return nameB.localeCompare(nameA, 'en', { sensitivity: 'base' });
    }
    if (sortBy === 'createdAt-asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

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

export interface UpdateCustomerInput {
  id: string;
  name?: string;
  phoneNumber?: string;
  email?: string | null;
  address?: string | null;
}

export async function updateCustomer(input: UpdateCustomerInput) {
  const [existing] = await db
    .select()
    .from(customerDetailsTable)
    .where(eq(customerDetailsTable.id, input.id));

  if (!existing) {
    throw new Error('Customer not found');
  }

  const name = input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) {
    throw new Error('Customer name cannot be empty');
  }

  const phoneNumber = input.phoneNumber !== undefined ? input.phoneNumber.trim() : existing.phoneNumber;
  if (!phoneNumber) {
    throw new Error('Phone number cannot be empty');
  }

  const nameSlug = generateSlug(name);
  const email = input.email !== undefined ? (input.email?.trim() || null) : existing.email;
  const address = input.address !== undefined ? (input.address?.trim() || null) : existing.address;

  // Check if updating causes a duplicate with another customer
  if (nameSlug !== existing.nameSlug || phoneNumber !== existing.phoneNumber) {
    const duplicates = await db
      .select()
      .from(customerDetailsTable)
      .where(
        and(
          eq(customerDetailsTable.nameSlug, nameSlug),
          eq(customerDetailsTable.phoneNumber, phoneNumber)
        )
      );
    const otherDuplicate = duplicates.find((d) => d.id !== input.id);
    if (otherDuplicate) {
      throw new Error('Another customer with this name and phone number already exists');
    }
  }

  const [updated] = await db
    .update(customerDetailsTable)
    .set({
      name,
      nameSlug,
      phoneNumber,
      email,
      address,
      updatedAt: new Date(),
    })
    .where(eq(customerDetailsTable.id, input.id))
    .returning();

  return updated;
}

export async function deleteCustomer(id: string) {
  const [deleted] = await db
    .delete(customerDetailsTable)
    .where(eq(customerDetailsTable.id, id))
    .returning();

  if (!deleted) {
    throw new Error('Customer not found');
  }

  return { success: true, id: deleted.id };
}

export interface SearchCustomersInput {
  query?: string | null;
  limit?: number | null;
}

export async function searchCustomers(input?: SearchCustomersInput) {
  const query = (input?.query || '').trim();
  const limit = Math.max(1, input?.limit || 20);

  if (query) {
    const pattern = `%${query}%`;
    const cleanDigits = query.replace(/\D/g, '');
    const isPhoneSearch = cleanDigits.length >= 10;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    try {
      const conditions = [
        ilike(customerDetailsTable.name, pattern),
        ilike(customerDetailsTable.phoneNumber, pattern),
        ilike(customerDetailsTable.email, pattern),
        ilike(customerDetailsTable.address, pattern),
      ];

      if (UUID_REGEX.test(query)) {
        conditions.push(eq(customerDetailsTable.id, query));
      }

      if (isPhoneSearch) {
        conditions.push(sql`regexp_replace(${customerDetailsTable.phoneNumber}, '[^0-9]', '', 'g') = ${cleanDigits}`);
      }

      const rows = await db
        .select({
          id: customerDetailsTable.id,
          userId: customerDetailsTable.userId,
          name: customerDetailsTable.name,
          nameSlug: customerDetailsTable.nameSlug,
          phoneNumber: customerDetailsTable.phoneNumber,
          email: customerDetailsTable.email,
          address: customerDetailsTable.address,
          createdAt: customerDetailsTable.createdAt,
          updatedAt: customerDetailsTable.updatedAt,
        })
        .from(customerDetailsTable)
        .where(or(...conditions))
        .orderBy(desc(customerDetailsTable.createdAt))
        .limit(limit);

      return {
        items: rows,
        total: rows.length,
        query,
      };
    } catch (err) {
      console.warn('[searchCustomers ILIKE DB notice]:', err);
    }
  }

  const res = await getPaginatedCustomers({
    search: query,
    limit,
    page: 1,
  });
  return {
    items: res.items,
    total: res.total,
    query,
  };
}

export interface CustomerSuggestionItem {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  similarity?: number;
}

export async function getCustomerSuggestions(query: string, limit = 8) {
  const q = (query || '').trim();
  if (!q) {
    return { query: '', suggestions: [] };
  }

  try {
    const rows = await db
      .select({
        id: customerDetailsTable.id,
        name: customerDetailsTable.name,
        phoneNumber: customerDetailsTable.phoneNumber,
        email: customerDetailsTable.email,
        address: customerDetailsTable.address,
        nameSim: sql<number>`similarity(${customerDetailsTable.name}, ${q})`,
        wordSim: sql<number>`word_similarity(${q}, ${customerDetailsTable.name})`,
        phoneSim: sql<number>`word_similarity(${q}, ${customerDetailsTable.phoneNumber})`,
      })
      .from(customerDetailsTable)
      .where(
        or(
          sql`similarity(${customerDetailsTable.name}, ${q}) > 0.1`,
          sql`word_similarity(${q}, ${customerDetailsTable.name}) > 0.15`,
          sql`word_similarity(${q}, ${customerDetailsTable.phoneNumber}) > 0.15`,
          sql`word_similarity(${q}, ${customerDetailsTable.email}) > 0.15`
        )
      )
      .orderBy(sql`GREATEST(similarity(${customerDetailsTable.name}, ${q}), word_similarity(${q}, ${customerDetailsTable.name})) DESC`)
      .limit(limit);

    return {
      query: q,
      suggestions: rows.map((r) => ({
        id: r.id,
        name: r.name,
        phoneNumber: r.phoneNumber,
        email: r.email,
        address: r.address,
        similarity: Math.max(r.nameSim || 0, r.wordSim || 0, r.phoneSim || 0),
      })),
    };
  } catch (err) {
    console.warn('[getCustomerSuggestions pg_trgm DB notice]:', err);
    return { query: q, suggestions: [] };
  }
}

