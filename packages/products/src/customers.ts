import {
  db,
  customerDetails as customerDetailsTable,
  user as userTable,
} from '@repo/db';
import { desc, eq, and } from 'drizzle-orm';

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
    all = all.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const address = (c.address || '').toLowerCase();
      return (
        name.includes(search) ||
        phone.includes(search) ||
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
