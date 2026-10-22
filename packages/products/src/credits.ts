import {
  db,
  credits as creditsTable,
  orders as ordersTable,
  invoices as invoicesTable,
  customerDetails as customerDetailsTable,
  user as userTable,
} from '@repo/db';
import { desc, eq, sql } from 'drizzle-orm';

export interface CreateCreditInput {
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string | Date | null;
}

export interface UpdateCreditInput {
  id: string;
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount?: number;
  dueAmount?: number;
  dueDate?: string | Date | null;
}

export interface RecordPaymentInput {
  id: string;
  amount: number;
}

export async function getCredits() {
  const rows = await db
    .select({
      id: creditsTable.id,
      orderId: creditsTable.orderId,
      userId: creditsTable.userId,
      invoiceId: creditsTable.invoiceId,
      paidAmount: creditsTable.paidAmount,
      dueAmount: creditsTable.dueAmount,
      dueDate: creditsTable.dueDate,
      createdAt: creditsTable.createdAt,
      updatedAt: creditsTable.updatedAt,
      // Order metadata
      orderNumber: ordersTable.orderNumber,
      orderTotal: ordersTable.totalAmount,
      // Invoice metadata
      invoiceNumber: invoicesTable.invoiceNumber,
      // Customer metadata from invoice or order
      customerName: sql<string | null>`COALESCE(${invoicesTable.customerName}, ${customerDetailsTable.name})`,
      customerPhone: sql<string | null>`COALESCE(${invoicesTable.phoneNumber}, ${customerDetailsTable.phoneNumber})`,
      customerEmail: sql<string | null>`COALESCE(${invoicesTable.email}, ${customerDetailsTable.email})`,
      customerAddress: customerDetailsTable.address,
      userEmail: userTable.email,
    })
    .from(creditsTable)
    .leftJoin(ordersTable, eq(creditsTable.orderId, ordersTable.id))
    .leftJoin(invoicesTable, eq(creditsTable.invoiceId, invoicesTable.id))
    .leftJoin(
      customerDetailsTable,
      eq(ordersTable.customerId, customerDetailsTable.id)
    )
    .leftJoin(userTable, eq(creditsTable.userId, userTable.id))
    .orderBy(desc(creditsTable.createdAt));

  const totalPaid = rows.reduce(
    (sum, r) => sum + (Number(r.paidAmount) || 0),
    0
  );
  const totalDue = rows.reduce(
    (sum, r) => sum + (Number(r.dueAmount) || 0),
    0
  );
  const overdueCount = rows.filter(
    (r) =>
      r.dueDate &&
      Number(r.dueAmount) > 0 &&
      new Date(r.dueDate).getTime() < Date.now()
  ).length;
  const pendingCount = rows.filter((r) => Number(r.dueAmount) > 0).length;
  const settledCount = rows.filter((r) => Number(r.dueAmount) <= 0).length;

  return {
    credits: rows,
    metrics: {
      totalCredits: rows.length,
      totalPaid,
      totalDue,
      pendingCount,
      settledCount,
      overdueCount,
    },
  };
}

export async function createCredit(input: CreateCreditInput) {
  const paidAmount = Math.max(0, Number(input.paidAmount) || 0);
  const dueAmount = Math.max(0, Number(input.dueAmount) || 0);

  const [newCredit] = await db
    .insert(creditsTable)
    .values({
      orderId: input.orderId || null,
      userId: input.userId || null,
      invoiceId: input.invoiceId || null,
      paidAmount: paidAmount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    })
    .returning();

  return newCredit;
}

export async function updateCredit(input: UpdateCreditInput) {
  const [existing] = await db
    .select()
    .from(creditsTable)
    .where(eq(creditsTable.id, input.id));

  if (!existing) {
    throw new Error('Credit record not found');
  }

  const updateValues: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (input.orderId !== undefined) updateValues.orderId = input.orderId;
  if (input.userId !== undefined) updateValues.userId = input.userId;
  if (input.invoiceId !== undefined) updateValues.invoiceId = input.invoiceId;
  if (input.paidAmount !== undefined) {
    updateValues.paidAmount = Math.max(0, Number(input.paidAmount) || 0).toFixed(2);
  }
  if (input.dueAmount !== undefined) {
    updateValues.dueAmount = Math.max(0, Number(input.dueAmount) || 0).toFixed(2);
  }
  if (input.dueDate !== undefined) {
    updateValues.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }

  const [updated] = await db
    .update(creditsTable)
    .set(updateValues)
    .where(eq(creditsTable.id, input.id))
    .returning();

  return updated;
}

export async function recordCreditPayment(input: RecordPaymentInput) {
  const [existing] = await db
    .select()
    .from(creditsTable)
    .where(eq(creditsTable.id, input.id));

  if (!existing) {
    throw new Error('Credit record not found');
  }

  const payment = Math.max(0, Number(input.amount) || 0);
  const currentPaid = Number(existing.paidAmount) || 0;
  const currentDue = Number(existing.dueAmount) || 0;

  const newPaid = currentPaid + payment;
  const newDue = Math.max(0, currentDue - payment);

  const [updated] = await db
    .update(creditsTable)
    .set({
      paidAmount: newPaid.toFixed(2),
      dueAmount: newDue.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(creditsTable.id, input.id))
    .returning();

  return updated;
}

export async function deleteCredit(id: string) {
  const [deleted] = await db
    .delete(creditsTable)
    .where(eq(creditsTable.id, id))
    .returning();

  if (!deleted) {
    throw new Error('Credit record not found');
  }

  return { success: true, id: deleted.id };
}
