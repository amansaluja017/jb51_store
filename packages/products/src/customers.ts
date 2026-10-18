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
