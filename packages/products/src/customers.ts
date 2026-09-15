import {
  db,
  customerDetails as customerDetailsTable,
  user as userTable,
} from '@repo/db';
import { desc, eq, or } from 'drizzle-orm';

export interface CreateCustomerInput {
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
}

export async function getCustomers() {
  const rows = await db
    .select({
      id: customerDetailsTable.id,
      userId: customerDetailsTable.userId,
      name: customerDetailsTable.name,
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

  const email = input.email?.trim() || null;
  const phoneNumber = input.phoneNumber?.trim() || null;
  const address = input.address?.trim() || null;

  return await db.transaction(async (tx) => {
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

      // Check if username is unique
      let usernameCandidate = name;
      const [nameConflict] = await tx
        .select()
        .from(userTable)
        .where(eq(userTable.name, usernameCandidate));

      if (nameConflict) {
        usernameCandidate = `${name}_${Date.now().toString().slice(-4)}`;
      }

      const [newUser] = await tx
        .insert(userTable)
        .values({
          name: usernameCandidate,
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
        phoneNumber,
        email,
        address,
      })
      .returning();

    return customer;
  });
}
