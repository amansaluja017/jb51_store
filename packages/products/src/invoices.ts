import {
  db,
  invoices as invoicesTable,
  customerDetails as customerDetailsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  inventry as inventryTable,
  productStatus as productStatusTable,
  credits as creditsTable,
  creditTransactions as creditTransactionsTable,
  InvoiceItem,
} from '@repo/db';
import { desc, eq, or, and, isNotNull, inArray } from 'drizzle-orm';

export interface CreateInvoiceInput {
  invoiceNumber?: string;
  orderId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  productId?: string | null;
  userId?: string | null;
  quantity?: number;
  mode?: 'cash' | 'online' | 'credit';
  subtotal?: number | null;
  gst?: number | null;
  taxRate?: number | string | null;
  discount?: number | null;
  totalAmount?: number | null;
  finalAmount?: number | null;
  items?: InvoiceItem[];
  notes?: string | null;
  paidAmount?: number | string | null;
  dueAmount?: number | string | null;
  dueDate?: string | Date | null;
  advancePaymentMode?: string | null;
}

export async function createInvoice(input: CreateInvoiceInput) {
  const invoiceNumber =
    input.invoiceNumber ||
    `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const finalAmount =
    input.finalAmount !== undefined && input.finalAmount !== null
      ? input.finalAmount
      : input.totalAmount || 0;

  // Check if invoice for this orderId or invoiceNumber already exists
  let existingInv = null;
  if (input.orderId) {
    const [found] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.orderId, input.orderId));
    existingInv = found;
  }
  if (!existingInv && input.invoiceNumber) {
    const [found] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.invoiceNumber, input.invoiceNumber));
    existingInv = found;
  }

  let inv;
  if (existingInv) {
    const [updated] = await db
      .update(invoicesTable)
      .set({
        customerName: input.customerName || existingInv.customerName,
        phoneNumber: input.phoneNumber || existingInv.phoneNumber,
        email: input.email || existingInv.email,
        subtotal:
          input.subtotal !== undefined && input.subtotal !== null
            ? input.subtotal.toString()
            : existingInv.subtotal,
        gst:
          input.gst !== undefined && input.gst !== null
            ? input.gst.toString()
            : existingInv.gst,
        taxRate:
          input.taxRate !== undefined && input.taxRate !== null
            ? input.taxRate.toString()
            : existingInv.taxRate,
        discount:
          input.discount !== undefined && input.discount !== null
            ? input.discount.toString()
            : existingInv.discount,
        totalAmount:
          input.totalAmount !== undefined && input.totalAmount !== null
            ? input.totalAmount.toString()
            : existingInv.totalAmount,
        finalAmount: finalAmount.toString(),
        items: input.items && input.items.length > 0 ? input.items : existingInv.items,
        notes: input.notes !== undefined ? input.notes : existingInv.notes,
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.id, existingInv.id))
      .returning();
    inv = updated;
  } else {
    const [inserted] = await db
      .insert(invoicesTable)
      .values({
        invoiceNumber,
        orderId: input.orderId || null,
        customerId: input.customerId || null,
        customerName: input.customerName || null,
        phoneNumber: input.phoneNumber || null,
        email: input.email || null,
        productId: input.productId || null,
        userId: input.userId || null,
        quantity: input.quantity || 1,
        mode: input.mode || 'cash',
        subtotal: input.subtotal !== undefined && input.subtotal !== null ? input.subtotal.toString() : null,
        gst: input.gst !== undefined && input.gst !== null ? input.gst.toString() : '0',
        taxRate: input.taxRate !== undefined && input.taxRate !== null ? input.taxRate.toString() : '0',
        discount: input.discount !== undefined && input.discount !== null ? input.discount.toString() : '0',
        totalAmount: input.totalAmount !== undefined && input.totalAmount !== null ? input.totalAmount.toString() : null,
        finalAmount: finalAmount.toString(),
        items: input.items || [],
        notes: input.notes || null,
      })
      .returning();
    inv = inserted;
  }

  // Record or update credit if mode is credit or dueAmount is specified
  if (
    input.mode === 'credit' ||
    (input.dueAmount !== undefined && input.dueAmount !== null && Number(input.dueAmount) > 0)
  ) {
    const paidAmt = Math.max(0, Number(input.paidAmount) || 0);
    const dueAmt =
      input.dueAmount !== undefined && input.dueAmount !== null
        ? Math.max(0, Number(input.dueAmount))
        : Math.max(0, Number(finalAmount) - paidAmt);
    const dDate = input.dueDate ? new Date(input.dueDate) : null;
    const advMode = input.advancePaymentMode
      ? input.advancePaymentMode.toLowerCase()
      : paidAmt > 0
        ? 'cash'
        : null;

    const [existingCredit] = await db
      .select()
      .from(creditsTable)
      .where(
        inv.orderId
          ? or(eq(creditsTable.invoiceId, inv.id), eq(creditsTable.orderId, inv.orderId))
          : eq(creditsTable.invoiceId, inv.id)
      );

    let creditId = existingCredit?.id;
    if (existingCredit) {
      await db
        .update(creditsTable)
        .set({
          paidAmount: paidAmt.toFixed(2),
          dueAmount: dueAmt.toFixed(2),
          dueDate: dDate,
          advancePaymentMode: advMode || existingCredit.advancePaymentMode,
          updatedAt: new Date(),
        })
        .where(eq(creditsTable.id, existingCredit.id));
    } else {
      const [newCredit] = await db.insert(creditsTable).values({
        invoiceId: inv.id,
        orderId: inv.orderId || null,
        userId: inv.userId || null,
        paidAmount: paidAmt.toFixed(2),
        dueAmount: dueAmt.toFixed(2),
        dueDate: dDate,
        advancePaymentMode: advMode,
      }).returning();
      creditId = newCredit.id;
    }

    // Check if initial advance transaction needs to be logged
    if (creditId && paidAmt > 0) {
      const existingTx = await db
        .select()
        .from(creditTransactionsTable)
        .where(
          and(
            eq(creditTransactionsTable.creditId, creditId),
            eq(creditTransactionsTable.transactionType, 'advance')
          )
        );

      if (existingTx.length === 0) {
        await db.insert(creditTransactionsTable).values({
          creditId,
          invoiceId: inv.id,
          orderId: inv.orderId || null,
          userId: inv.userId || null,
          amount: paidAmt.toFixed(2),
          paymentMode: advMode || 'cash',
          transactionType: 'advance',
          notes: 'Advance payment on invoice creation',
        });
      }
    }
  }

  return inv;
}

export async function getInvoices() {
  const rows = await db
    .select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      orderId: invoicesTable.orderId,
      customerId: invoicesTable.customerId,
      customerName: invoicesTable.customerName,
      phoneNumber: invoicesTable.phoneNumber,
      email: invoicesTable.email,
      productId: invoicesTable.productId,
      userId: invoicesTable.userId,
      quantity: invoicesTable.quantity,
      mode: invoicesTable.mode,
      subtotal: invoicesTable.subtotal,
      gst: invoicesTable.gst,
      taxRate: invoicesTable.taxRate,
      discount: invoicesTable.discount,
      totalAmount: invoicesTable.totalAmount,
      finalAmount: invoicesTable.finalAmount,
      items: invoicesTable.items,
      notes: invoicesTable.notes,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
      // Joined customer info
      custName: customerDetailsTable.name,
      custPhone: customerDetailsTable.phoneNumber,
      custEmail: customerDetailsTable.email,
      custAddress: customerDetailsTable.address,
      // Joined order number
      orderNumber: ordersTable.orderNumber,
      // Joined credit details
      creditId: creditsTable.id,
      creditPaidAmount: creditsTable.paidAmount,
      creditDueAmount: creditsTable.dueAmount,
      creditDueDate: creditsTable.dueDate,
      creditAdvancePaymentMode: creditsTable.advancePaymentMode,
    })
    .from(invoicesTable)
    .leftJoin(
      customerDetailsTable,
      eq(invoicesTable.customerId, customerDetailsTable.id)
    )
    .leftJoin(
      ordersTable,
      eq(invoicesTable.orderId, ordersTable.id)
    )
    .leftJoin(
      creditsTable,
      or(
        eq(invoicesTable.id, creditsTable.invoiceId),
        and(eq(invoicesTable.orderId, creditsTable.orderId), isNotNull(invoicesTable.orderId))
      )
    )
    .orderBy(desc(invoicesTable.createdAt));

  // Deduplicate by invoice ID in case multiple credits matched
  const seen = new Set<string>();
  const deduplicated: typeof rows = [];
  for (const row of rows) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      deduplicated.push(row);
    }
  }

  const creditIds = deduplicated
    .map((r) => r.creditId)
    .filter((id): id is string => Boolean(id));

  const invoiceIds = deduplicated.map((r) => r.id);

  let allTx: (typeof creditTransactionsTable.$inferSelect)[] = [];
  if (creditIds.length > 0 || invoiceIds.length > 0) {
    allTx = await db
      .select()
      .from(creditTransactionsTable)
      .where(
        creditIds.length > 0
          ? or(
              inArray(creditTransactionsTable.creditId, creditIds),
              inArray(creditTransactionsTable.invoiceId, invoiceIds)
            )
          : inArray(creditTransactionsTable.invoiceId, invoiceIds)
      )
      .orderBy(desc(creditTransactionsTable.createdAt));
  }

  return deduplicated.map((row) => {
    const isCredit = (row.mode || '').toLowerCase() === 'credit';
    const total = Number(row.finalAmount ?? row.totalAmount ?? 0);
    const creditDue =
      row.creditDueAmount !== null && row.creditDueAmount !== undefined
        ? Number(row.creditDueAmount)
        : isCredit
          ? total
          : null;
    const creditPaid =
      row.creditPaidAmount !== null && row.creditPaidAmount !== undefined
        ? Number(row.creditPaidAmount)
        : isCredit
          ? 0
          : null;

    const invoiceTransactions = allTx.filter(
      (tx) =>
        (row.creditId && tx.creditId === row.creditId) ||
        tx.invoiceId === row.id ||
        (row.orderId && tx.orderId === row.orderId)
    );

    return {
      ...row,
      customerName: row.custName || row.customerName || 'Walk-in Customer',
      phoneNumber: row.custPhone || row.phoneNumber || '',
      email: row.custEmail || row.email || '',
      address: row.custAddress || '',
      paidAmount: creditPaid !== null ? creditPaid.toString() : null,
      dueAmount: creditDue !== null ? creditDue.toString() : null,
      dueDate: row.creditDueDate ? row.creditDueDate.toISOString() : null,
      advancePaymentMode: row.creditAdvancePaymentMode || null,
      creditTransactions: invoiceTransactions,
    };
  });
}

export interface UpdateInvoiceInput {
  id: string;
  customerId?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  productId?: string | null;
  userId?: string | null;
  quantity?: number;
  mode?: 'cash' | 'online' | 'credit';
  subtotal?: number | null;
  gst?: number | null;
  taxRate?: number | string | null;
  discount?: number | null;
  totalAmount?: number | null;
  finalAmount?: number | null;
  items?: InvoiceItem[];
  notes?: string | null;
  paidAmount?: number | string | null;
  dueAmount?: number | string | null;
  dueDate?: string | Date | null;
  advancePaymentMode?: string | null;
}

export async function updateInvoice(input: UpdateInvoiceInput) {
  return await db.transaction(async (tx) => {
    // 1. Find existing invoice
    const [existingInv] = await tx
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, input.id));

    if (!existingInv) {
      throw new Error(`Invoice with ID ${input.id} not found`);
    }

    const finalAmount =
      input.finalAmount !== undefined && input.finalAmount !== null
        ? input.finalAmount
        : input.totalAmount !== undefined && input.totalAmount !== null
          ? input.totalAmount
          : Number(existingInv.finalAmount || existingInv.totalAmount || 0);

    const newItems = input.items !== undefined ? input.items : existingInv.items || [];
    const totalQuantity = newItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
    const paymentMode = input.mode || (existingInv.mode as 'cash' | 'online' | 'credit') || 'cash';

    const customerId = input.customerId !== undefined ? input.customerId : existingInv.customerId;
    const clientName = input.customerName !== undefined ? input.customerName : existingInv.customerName;
    const phoneNumber = input.phoneNumber !== undefined ? input.phoneNumber : existingInv.phoneNumber;
    const email = input.email !== undefined ? input.email : existingInv.email;
    const address = input.address;

    // If customer details changed and customerId exists, synchronize customer details table
    if (customerId) {
      await tx
        .update(customerDetailsTable)
        .set({
          name: clientName || undefined,
          phoneNumber: phoneNumber || undefined,
          email: email || undefined,
          address: address || undefined,
          updatedAt: new Date(),
        })
        .where(eq(customerDetailsTable.id, customerId));
    }

    // 2. Update invoice
    const [updatedInv] = await tx
      .update(invoicesTable)
      .set({
        customerId,
        customerName: clientName,
        phoneNumber,
        email,
        productId: newItems[0]?.productId || existingInv.productId || null,
        quantity: totalQuantity || 1,
        mode: paymentMode,
        subtotal: input.subtotal !== undefined && input.subtotal !== null ? input.subtotal.toString() : existingInv.subtotal,
        gst: input.gst !== undefined && input.gst !== null ? input.gst.toString() : existingInv.gst,
        taxRate: input.taxRate !== undefined && input.taxRate !== null ? input.taxRate.toString() : existingInv.taxRate,
        discount: input.discount !== undefined && input.discount !== null ? input.discount.toString() : existingInv.discount,
        totalAmount: input.totalAmount !== undefined && input.totalAmount !== null ? input.totalAmount.toString() : existingInv.totalAmount,
        finalAmount: finalAmount.toString(),
        items: newItems,
        notes: input.notes !== undefined ? input.notes : existingInv.notes,
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.id, existingInv.id))
      .returning();

    // 3. Synchronize corresponding order
    let orderId = existingInv.orderId;
    if (!orderId && existingInv.invoiceNumber) {
      const orderNumber = existingInv.invoiceNumber.replace('INV', 'ORD');
      const [matched] = await tx
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.orderNumber, orderNumber));
      if (matched) {
        orderId = matched.id;
        await tx.update(invoicesTable).set({ orderId }).where(eq(invoicesTable.id, existingInv.id));
      }
    }

    if (orderId) {
      // Update order header
      await tx
        .update(ordersTable)
        .set({
          customerId,
          paymentMethod: paymentMode,
          subtotal: input.subtotal !== undefined && input.subtotal !== null ? input.subtotal.toString() : undefined,
          gst: input.gst !== undefined && input.gst !== null ? input.gst.toString() : undefined,
          taxRate: input.taxRate !== undefined && input.taxRate !== null ? input.taxRate.toString() : undefined,
          discount: input.discount !== undefined && input.discount !== null ? input.discount.toString() : undefined,
          totalAmount: finalAmount.toString(),
          notes: input.notes !== undefined ? input.notes : undefined,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, orderId));

      // If items were provided in input, reconcile inventory and update order_items
      if (input.items !== undefined) {
        const oldItems = await tx
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, orderId));

        // Revert old inventory
        const affectedProductIds = new Set<string>();
        for (const oldIt of oldItems) {
          if (!oldIt.productId) continue;
          affectedProductIds.add(oldIt.productId);
          const qty = Math.floor(Number(oldIt.quantity));
          if (qty > 0) {
            const invRows = await tx
              .select()
              .from(inventryTable)
              .where(
                oldIt.productVariantId
                  ? and(
                      eq(inventryTable.productId, oldIt.productId),
                      eq(inventryTable.productVariant, oldIt.productVariantId)
                    )
                  : eq(inventryTable.productId, oldIt.productId)
              );
            if (invRows.length > 0) {
              const invRow = invRows[0]!;
              await tx
                .update(inventryTable)
                .set({
                  availableStock: invRow.availableStock + qty,
                  totalStock: (invRow.totalStock || invRow.availableStock) + qty,
                  updatedAt: new Date(),
                })
                .where(eq(inventryTable.id, invRow.id));
            }
          }
        }

        // Deduct new inventory
        for (const newIt of newItems) {
          if (!newIt.productId) continue;
          affectedProductIds.add(newIt.productId);
          const qty = Math.floor(Number(newIt.quantity));
          if (qty > 0) {
            const invRows = await tx
              .select()
              .from(inventryTable)
              .where(
                newIt.productVariantId
                  ? and(
                      eq(inventryTable.productId, newIt.productId),
                      eq(inventryTable.productVariant, newIt.productVariantId)
                    )
                  : eq(inventryTable.productId, newIt.productId)
              );
            if (invRows.length > 0) {
              const invRow = invRows[0]!;
              const newAvail = Math.max(0, invRow.availableStock - qty);
              const newTot = Math.max(0, (invRow.totalStock || invRow.availableStock) - qty);
              await tx
                .update(inventryTable)
                .set({
                  availableStock: newAvail,
                  totalStock: newTot,
                  updatedAt: new Date(),
                })
                .where(eq(inventryTable.id, invRow.id));
            }
          }
        }

        // Update productStatus inStock flag
        for (const prodId of affectedProductIds) {
          const allProdInv = await tx
            .select()
            .from(inventryTable)
            .where(eq(inventryTable.productId, prodId));
          const totalAvail = allProdInv.reduce(
            (sum, it) => sum + (it.availableStock || 0),
            0
          );
          await tx
            .insert(productStatusTable)
            .values({
              productId: prodId,
              status: 'listed',
              inStock: totalAvail > 0,
            })
            .onConflictDoUpdate({
              target: productStatusTable.productId,
              set: { inStock: totalAvail > 0, updatedAt: new Date() },
            });
        }

        // Replace order items
        await tx
          .delete(orderItemsTable)
          .where(eq(orderItemsTable.orderId, orderId));

        if (newItems.length > 0) {
          await tx
            .insert(orderItemsTable)
            .values(
              newItems.map((it) => ({
                orderId: orderId!,
                productId: it.productId || null,
                productVariantId: it.productVariantId || null,
                productName: it.productName,
                variantColor: it.variantColor || null,
                quantity: Number(it.quantity) || 1,
                unitPrice: it.unitPrice.toString(),
                total: it.total.toString(),
              }))
            );
        }
      }
    }

    // 4. Update credit if applicable
    if (
      paymentMode === 'credit' ||
      (input.dueAmount !== undefined && input.dueAmount !== null && Number(input.dueAmount) > 0)
    ) {
      const paidAmt = Math.max(0, Number(input.paidAmount) || 0);
      const dueAmt =
        input.dueAmount !== undefined && input.dueAmount !== null
          ? Math.max(0, Number(input.dueAmount))
          : Math.max(0, Number(finalAmount) - paidAmt);
      const dDate = input.dueDate ? new Date(input.dueDate) : null;
      const advMode = input.advancePaymentMode
        ? input.advancePaymentMode.toLowerCase()
        : paidAmt > 0
          ? 'cash'
          : null;

      const [existingCredit] = await tx
        .select()
        .from(creditsTable)
        .where(
          orderId
            ? or(eq(creditsTable.invoiceId, existingInv.id), eq(creditsTable.orderId, orderId))
            : eq(creditsTable.invoiceId, existingInv.id)
        );

      if (existingCredit) {
        await tx
          .update(creditsTable)
          .set({
            paidAmount: paidAmt.toFixed(2),
            dueAmount: dueAmt.toFixed(2),
            dueDate: dDate,
            advancePaymentMode: advMode || existingCredit.advancePaymentMode,
            updatedAt: new Date(),
          })
          .where(eq(creditsTable.id, existingCredit.id));
      } else {
        await tx.insert(creditsTable).values({
          invoiceId: existingInv.id,
          orderId: orderId || null,
          userId: input.userId || existingInv.userId || null,
          paidAmount: paidAmt.toFixed(2),
          dueAmount: dueAmt.toFixed(2),
          dueDate: dDate,
          advancePaymentMode: advMode,
        });
      }
    }

    return updatedInv;
  });
}

export async function deleteInvoice(id: string) {
  const [deleted] = await db
    .delete(invoicesTable)
    .where(eq(invoicesTable.id, id))
    .returning();
  return deleted;
}

export interface GetPaginatedInvoicesInput {
  search?: string | null;
  mode?: 'all' | 'cash' | 'online' | 'credit' | null;
  sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'amount-desc' | 'amount-asc' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedInvoices(input?: GetPaginatedInvoicesInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 10);
  const search = (input?.search || '').trim().toLowerCase();
  const mode = input?.mode;
  const sortBy = input?.sortBy || 'createdAt-desc';

  let all = await getInvoices();

  if (search) {
    all = all.filter((inv) => {
      const invNum = (inv.invoiceNumber || inv.id || '').toLowerCase();
      const custName = (inv.customerName || '').toLowerCase();
      const phone = (inv.phoneNumber || '').toLowerCase();
      const email = (inv.email || '').toLowerCase();
      const orderNum = (inv.orderNumber || '').toLowerCase();
      return (
        invNum.includes(search) ||
        custName.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        orderNum.includes(search)
      );
    });
  }

  if (mode && mode !== 'all') {
    all = all.filter((inv) => (inv.mode || '').toLowerCase() === mode.toLowerCase());
  }

  all.sort((a, b) => {
    if (sortBy === 'createdAt-asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'amount-desc') {
      const amtA = Number(a.finalAmount ?? a.totalAmount ?? 0);
      const amtB = Number(b.finalAmount ?? b.totalAmount ?? 0);
      return amtB - amtA;
    }
    if (sortBy === 'amount-asc') {
      const amtA = Number(a.finalAmount ?? a.totalAmount ?? 0);
      const amtB = Number(b.finalAmount ?? b.totalAmount ?? 0);
      return amtA - amtB;
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const items = all.slice(offset, offset + limit);

  const totalCollected = all.reduce(
    (sum, inv) => sum + (Number(inv.finalAmount ?? inv.totalAmount ?? 0) || 0),
    0
  );
  const cashCollected = all.reduce((sum, inv) => {
    const m = (inv.mode || '').toLowerCase();
    return m === 'cash' ? sum + (Number(inv.finalAmount ?? inv.totalAmount ?? 0) || 0) : sum;
  }, 0);

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
    totalCollected,
    cashCollected,
  };
}
