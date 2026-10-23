import {
  db,
  credits as creditsTable,
  creditTransactions as creditTransactionsTable,
  orders as ordersTable,
  invoices as invoicesTable,
  customerDetails as customerDetailsTable,
  user as userTable,
} from '@repo/db';
import { desc, eq, inArray, sql } from 'drizzle-orm';

export interface CreateCreditInput {
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string | Date | null;
  advancePaymentMode?: string | null;
  notes?: string | null;
}

export interface UpdateCreditInput {
  id: string;
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount?: number;
  dueAmount?: number;
  dueDate?: string | Date | null;
  advancePaymentMode?: string | null;
}

export interface RecordPaymentInput {
  id: string;
  amount: number;
  paymentMode?: string | null;
  notes?: string | null;
  userId?: string | null;
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
      advancePaymentMode: creditsTable.advancePaymentMode,
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

  const creditIds = rows.map((r) => r.id);
  let allTransactions: (typeof creditTransactionsTable.$inferSelect)[] = [];
  if (creditIds.length > 0) {
    allTransactions = await db
      .select()
      .from(creditTransactionsTable)
      .where(inArray(creditTransactionsTable.creditId, creditIds))
      .orderBy(desc(creditTransactionsTable.createdAt));
  }

  const txByCreditId = new Map<string, (typeof creditTransactionsTable.$inferSelect)[]>();
  for (const tx of allTransactions) {
    const list = txByCreditId.get(tx.creditId) || [];
    list.push(tx);
    txByCreditId.set(tx.creditId, list);
  }

  const creditsWithTransactions = rows.map((r) => ({
    ...r,
    transactions: txByCreditId.get(r.id) || [],
  }));

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
    credits: creditsWithTransactions,
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
  const advancePaymentMode = input.advancePaymentMode
    ? input.advancePaymentMode.toLowerCase()
    : paidAmount > 0
      ? 'cash'
      : null;

  return await db.transaction(async (tx) => {
    const [newCredit] = await tx
      .insert(creditsTable)
      .values({
        orderId: input.orderId || null,
        userId: input.userId || null,
        invoiceId: input.invoiceId || null,
        paidAmount: paidAmount.toFixed(2),
        dueAmount: dueAmount.toFixed(2),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        advancePaymentMode,
      })
      .returning();

    // If initial advance payment made, record in credit_transactions
    let advanceTx = null;
    if (paidAmount > 0) {
      const [insertedTx] = await tx
        .insert(creditTransactionsTable)
        .values({
          creditId: newCredit.id,
          orderId: newCredit.orderId || null,
          invoiceId: newCredit.invoiceId || null,
          userId: newCredit.userId || null,
          amount: paidAmount.toFixed(2),
          paymentMode: advancePaymentMode || 'cash',
          transactionType: 'advance',
          notes: input.notes || 'Advance payment on credit account opening',
        })
        .returning();
      advanceTx = insertedTx;
    }

    return {
      ...newCredit,
      transactions: advanceTx ? [advanceTx] : [],
    };
  });
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
  if (input.advancePaymentMode !== undefined) {
    updateValues.advancePaymentMode = input.advancePaymentMode ? input.advancePaymentMode.toLowerCase() : null;
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
  if (payment <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  const currentPaid = Number(existing.paidAmount) || 0;
  const currentDue = Number(existing.dueAmount) || 0;

  const newPaid = currentPaid + payment;
  const newDue = Math.max(0, currentDue - payment);
  const paymentMode = (input.paymentMode || 'cash').toLowerCase();

  return await db.transaction(async (tx) => {
    // 1. Record transaction in credit_transactions
    const [txRecord] = await tx
      .insert(creditTransactionsTable)
      .values({
        creditId: existing.id,
        orderId: existing.orderId || null,
        invoiceId: existing.invoiceId || null,
        userId: input.userId || existing.userId || null,
        amount: payment.toFixed(2),
        paymentMode,
        transactionType: 'payment',
        notes: input.notes || 'Credit installment payment',
      })
      .returning();

    // 2. Update credit record balances
    const [updatedCredit] = await tx
      .update(creditsTable)
      .set({
        paidAmount: newPaid.toFixed(2),
        dueAmount: newDue.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(creditsTable.id, input.id))
      .returning();

    // 3. Update linked invoice if present so invoice reflects payment
    if (existing.invoiceId) {
      await tx
        .update(invoicesTable)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(invoicesTable.id, existing.invoiceId));
    } else if (existing.orderId) {
      await tx
        .update(invoicesTable)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(invoicesTable.orderId, existing.orderId));
    }

    return {
      ...updatedCredit,
      transaction: txRecord,
    };
  });
}

export async function getCreditTransactions(creditId?: string, invoiceId?: string) {
  if (!creditId && !invoiceId) {
    return await db
      .select()
      .from(creditTransactionsTable)
      .orderBy(desc(creditTransactionsTable.createdAt));
  }

  if (creditId && invoiceId) {
    return await db
      .select()
      .from(creditTransactionsTable)
      .where(
        sql`${creditTransactionsTable.creditId} = ${creditId} OR ${creditTransactionsTable.invoiceId} = ${invoiceId}`
      )
      .orderBy(desc(creditTransactionsTable.createdAt));
  }

  if (creditId) {
    return await db
      .select()
      .from(creditTransactionsTable)
      .where(eq(creditTransactionsTable.creditId, creditId))
      .orderBy(desc(creditTransactionsTable.createdAt));
  }

  return await db
    .select()
    .from(creditTransactionsTable)
    .where(eq(creditTransactionsTable.invoiceId, invoiceId!))
    .orderBy(desc(creditTransactionsTable.createdAt));
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

export interface GetPaginatedCreditsInput {
  search?: string | null;
  filterTab?: 'all' | 'pending' | 'overdue' | 'settled' | null;
  sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'dueAmount-desc' | 'dueDate-asc' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedCredits(input?: GetPaginatedCreditsInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 10);
  const search = (input?.search || '').trim().toLowerCase();
  const filterTab = input?.filterTab || 'all';
  const sortBy = input?.sortBy || 'createdAt-desc';

  const { credits, metrics } = await getCredits();
  let all = [...credits];

  const now = Date.now();
  if (filterTab === 'pending') {
    all = all.filter((c) => Number(c.dueAmount) > 0);
  } else if (filterTab === 'overdue') {
    all = all.filter(
      (c) => Number(c.dueAmount) > 0 && c.dueDate && new Date(c.dueDate).getTime() < now
    );
  } else if (filterTab === 'settled') {
    all = all.filter((c) => Number(c.dueAmount) <= 0);
  }

  if (search) {
    all = all.filter((c) => {
      const cName = (c.customerName || '').toLowerCase();
      const cPhone = (c.customerPhone || '').toLowerCase();
      const ordNum = (c.orderNumber || '').toLowerCase();
      const invNum = (c.invoiceNumber || '').toLowerCase();
      return (
        cName.includes(search) ||
        cPhone.includes(search) ||
        ordNum.includes(search) ||
        invNum.includes(search)
      );
    });
  }

  all.sort((a, b) => {
    if (sortBy === 'createdAt-asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'dueAmount-desc') {
      return Number(b.dueAmount || 0) - Number(a.dueAmount || 0);
    }
    if (sortBy === 'dueDate-asc') {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return timeA - timeB;
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
    metrics,
  };
}
