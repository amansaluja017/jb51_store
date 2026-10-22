import {
  db,
  invoices as invoicesTable,
  customerDetails as customerDetailsTable,
  orders as ordersTable,
  InvoiceItem,
} from '@repo/db';
import { desc, eq } from 'drizzle-orm';

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
    return updated;
  }

  const [inv] = await db
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
    .orderBy(desc(invoicesTable.createdAt));

  return rows.map((row) => ({
    ...row,
    customerName: row.custName || row.customerName || 'Walk-in Customer',
    phoneNumber: row.custPhone || row.phoneNumber || '',
    email: row.custEmail || row.email || '',
    address: row.custAddress || '',
  }));
}

export async function deleteInvoice(id: string) {
  const [deleted] = await db
    .delete(invoicesTable)
    .where(eq(invoicesTable.id, id))
    .returning();
  return deleted;
}
