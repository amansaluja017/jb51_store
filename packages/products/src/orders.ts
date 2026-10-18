import {
  db,
  orders as ordersTable,
  orderItems as orderItemsTable,
  customerDetails as customerDetailsTable,
  inventry as inventryTable,
  inventryTransaction as inventryTransactionTable,
  productStatus as productStatusTable,
  invoices as invoicesTable,
  OrderItemInput,
  InvoiceItem,
} from '@repo/db';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { generateSlug } from './customers.js';

export interface CreateOrderInput {
  orderNumber?: string;
  invoiceNumber?: string;
  customerId?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  userId?: string | null;
  status?: string;
  paymentMethod?: string;
  subtotal?: number | null;
  gst?: number | null;
  discount?: number | null;
  totalAmount: number;
  items: OrderItemInput[];
  notes?: string | null;
}

export async function createOrder(input: CreateOrderInput) {
  const orderNumber =
    input.orderNumber ||
    `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const invoiceNumber =
    input.invoiceNumber ||
    orderNumber.replace('ORD', 'INV');

  return await db.transaction(async (tx) => {
    // 1. Resolve or create customer in customer_details
    let customerId = input.customerId || null;
    let clientName = (input.customerName || '').trim();
    let phoneNumber = input.phoneNumber?.trim() || null;
    let email = input.email?.trim().toLowerCase() || null;
    let address = input.address?.trim() || null;

    if (customerId) {
      const [existing] = await tx
        .select()
        .from(customerDetailsTable)
        .where(eq(customerDetailsTable.id, customerId));
      if (existing) {
        if (!clientName) clientName = existing.name;
        if (!phoneNumber) phoneNumber = existing.phoneNumber || null;
        if (!email) email = existing.email || null;
        if (!address) address = existing.address || null;
      }
    } else if (clientName) {
      let existingCust: typeof customerDetailsTable.$inferSelect | undefined;

      if (phoneNumber) {
        const [found] = await tx
          .select()
          .from(customerDetailsTable)
          .where(eq(customerDetailsTable.phoneNumber, phoneNumber));
        existingCust = found;
      }
      if (!existingCust && email) {
        const [found] = await tx
          .select()
          .from(customerDetailsTable)
          .where(eq(customerDetailsTable.email, email));
        existingCust = found;
      }
      if (!existingCust) {
        const [found] = await tx
          .select()
          .from(customerDetailsTable)
          .where(eq(customerDetailsTable.name, clientName));
        existingCust = found;
      }

      if (existingCust) {
        customerId = existingCust.id;
        if (!phoneNumber) phoneNumber = existingCust.phoneNumber || null;
        if (!email) email = existingCust.email || null;
        if (!address) address = existingCust.address || null;
      } else {
        const slug = generateSlug(clientName);
        const [newCust] = await tx
          .insert(customerDetailsTable)
          .values({
            name: clientName,
            nameSlug: slug || 'customer',
            phoneNumber: phoneNumber || 'N/A',
            email,
            address,
          })
          .returning();
        customerId = newCust.id;
      }
    }

    // 2. Insert order header
    const [order] = await tx
      .insert(ordersTable)
      .values({
        orderNumber,
        customerId,
        userId: input.userId || null,
        status: input.status || 'confirmed',
        paymentMethod: input.paymentMethod || 'cash',
        subtotal:
          input.subtotal !== undefined && input.subtotal !== null
            ? input.subtotal.toString()
            : null,
        gst:
          input.gst !== undefined && input.gst !== null
            ? input.gst.toString()
            : '0',
        discount:
          input.discount !== undefined && input.discount !== null
            ? input.discount.toString()
            : '0',
        totalAmount: input.totalAmount.toString(),
        notes: input.notes || null,
      })
      .returning();

    // 3. Insert line items into order_items table
    let insertedItems: any[] = [];
    if (input.items && input.items.length > 0) {
      insertedItems = await tx
        .insert(orderItemsTable)
        .values(
          input.items.map((item) => ({
            orderId: order.id,
            productId: item.productId || null,
            productVariantId: item.productVariantId || null,
            productName: item.productName,
            variantColor: item.variantColor || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            total: item.total.toString(),
          }))
        )
        .returning();
    }

    // 4. Update inventory & record inventory transactions for items with productId
    const affectedProductIds = new Set<string>();

    for (const item of input.items || []) {
      if (!item.productId) continue;

      const quantity = Math.floor(Number(item.quantity));
      if (isNaN(quantity) || quantity <= 0) {
        continue;
      }

      affectedProductIds.add(item.productId);

      // Check if inventory transaction was already recorded for this invoice
      const noteStr = `Invoice sale (${invoiceNumber})`;
      const [existingTx] = await tx
        .select()
        .from(inventryTransactionTable)
        .where(
          and(
            eq(inventryTransactionTable.productId, item.productId),
            eq(inventryTransactionTable.notes, noteStr)
          )
        );
      if (existingTx) {
        continue;
      }

      // Locate inventory record
      const inventoryQuery = tx
        .select()
        .from(inventryTable)
        .where(
          item.productVariantId
            ? and(
                eq(inventryTable.productId, item.productId),
                eq(inventryTable.productVariant, item.productVariantId)
              )
            : eq(inventryTable.productId, item.productId)
        );

      const inventoryRows = await inventoryQuery;
      const invRow = inventoryRows.length > 0 ? inventoryRows[0] : null;

      // Validate stock availability
      const currentAvail = invRow ? invRow.availableStock : 0;
      if (!invRow || currentAvail < quantity) {
        throw new Error(
          `Insufficient stock for "${item.productName}". Available: ${currentAvail}, requested: ${quantity}`
        );
      }

      // Deduct stock
      const newAvail = currentAvail - quantity;
      const newTotal = (invRow.totalStock || currentAvail) - quantity;
      await tx
        .update(inventryTable)
        .set({
          availableStock: newAvail,
          totalStock: Math.max(0, newTotal),
          updatedAt: new Date(),
        })
        .where(eq(inventryTable.id, invRow.id));

      // Record transaction
      const itemUnitPrice = Number(item.unitPrice) || 0;
      const itemTotal =
        item.total !== undefined && item.total !== null
          ? Number(item.total)
          : itemUnitPrice * quantity;

      await tx
        .insert(inventryTransactionTable)
        .values({
          productId: item.productId,
          productVariant: item.productVariantId || null,
          type: 'sale',
          quantity,
          customerId,
          userId: input.userId || null,
          unitPrice: itemUnitPrice.toFixed(2),
          totalAmount: itemTotal.toFixed(2),
          notes: `Invoice sale (${invoiceNumber})`,
        });
    }

    // 5. Synchronize productStatus inStock flag for all affected products
    for (const prodId of affectedProductIds) {
      const allProdInv = await tx
        .select()
        .from(inventryTable)
        .where(eq(inventryTable.productId, prodId));
      const totalAvail = allProdInv.reduce(
        (sum, it) => sum + (it.availableStock || 0),
        0
      );
      const inStock = totalAvail > 0;

      await tx
        .insert(productStatusTable)
        .values({
          productId: prodId,
          status: 'listed',
          inStock,
        })
        .onConflictDoUpdate({
          target: productStatusTable.productId,
          set: { inStock, updatedAt: new Date() },
        });
    }

    // 6. Create Invoice in invoices table
    const invoiceItems: InvoiceItem[] = (input.items || []).map((item) => ({
      productId: item.productId || null,
      productVariantId: item.productVariantId || null,
      productName: item.productName,
      variantColor: item.variantColor || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const totalQty = (input.items || []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const paymentMode =
      input.paymentMethod?.toLowerCase() === 'cash' ? 'cash' : 'online';

    // 6. Create Invoice in invoices table (or update if already exists)
    let existingInvoice = null;
    if (order.id) {
      const [found] = await tx
        .select()
        .from(invoicesTable)
        .where(eq(invoicesTable.orderId, order.id));
      existingInvoice = found;
    }
    if (!existingInvoice && invoiceNumber) {
      const [found] = await tx
        .select()
        .from(invoicesTable)
        .where(eq(invoicesTable.invoiceNumber, invoiceNumber));
      existingInvoice = found;
    }

    let invoice;
    if (existingInvoice) {
      const [updated] = await tx
        .update(invoicesTable)
        .set({
          orderId: order.id,
          customerId,
          customerName: clientName || existingInvoice.customerName,
          phoneNumber: phoneNumber || existingInvoice.phoneNumber,
          email: email || existingInvoice.email,
          quantity: totalQty || existingInvoice.quantity,
          mode: paymentMode,
          subtotal:
            input.subtotal !== undefined && input.subtotal !== null
              ? input.subtotal.toString()
              : existingInvoice.subtotal,
          gst:
            input.gst !== undefined && input.gst !== null
              ? input.gst.toString()
              : existingInvoice.gst,
          discount:
            input.discount !== undefined && input.discount !== null
              ? input.discount.toString()
              : existingInvoice.discount,
          totalAmount: input.totalAmount.toString(),
          finalAmount: input.totalAmount.toString(),
          items: invoiceItems.length > 0 ? invoiceItems : existingInvoice.items,
          notes: input.notes !== undefined ? input.notes : existingInvoice.notes,
          updatedAt: new Date(),
        })
        .where(eq(invoicesTable.id, existingInvoice.id))
        .returning();
      invoice = updated;
    } else {
      const [inserted] = await tx
        .insert(invoicesTable)
        .values({
          invoiceNumber,
          orderId: order.id,
          customerId,
          customerName: clientName || null,
          phoneNumber,
          email,
          productId: input.items?.[0]?.productId || null,
          userId: input.userId || null,
          quantity: totalQty || 1,
          mode: paymentMode,
          subtotal:
            input.subtotal !== undefined && input.subtotal !== null
              ? input.subtotal.toString()
              : null,
          gst:
            input.gst !== undefined && input.gst !== null
              ? input.gst.toString()
              : '0',
          discount:
            input.discount !== undefined && input.discount !== null
              ? input.discount.toString()
              : '0',
          totalAmount: input.totalAmount.toString(),
          finalAmount: input.totalAmount.toString(),
          items: invoiceItems,
          notes: input.notes || null,
        })
        .returning();
      invoice = inserted;
    }

    return {
      ...order,
      items: insertedItems.map((it) => ({
        id: it.id,
        orderId: it.orderId,
        productId: it.productId,
        productVariantId: it.productVariantId,
        productName: it.productName,
        variantColor: it.variantColor,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        total: Number(it.total),
        createdAt: it.createdAt,
      })),
      invoice,
    };
  });
}

export async function getOrders() {
  const rows = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      customerId: ordersTable.customerId,
      userId: ordersTable.userId,
      customerName: customerDetailsTable.name,
      customerPhone: customerDetailsTable.phoneNumber,
      customerEmail: customerDetailsTable.email,
      customerAddress: customerDetailsTable.address,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      subtotal: ordersTable.subtotal,
      gst: ordersTable.gst,
      discount: ordersTable.discount,
      totalAmount: ordersTable.totalAmount,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
    })
    .from(ordersTable)
    .leftJoin(
      customerDetailsTable,
      eq(ordersTable.customerId, customerDetailsTable.id)
    )
    .orderBy(desc(ordersTable.createdAt));

  if (rows.length === 0) {
    return [];
  }

  // Fetch items for all fetched orders from order_items table
  const orderIds = rows.map((r) => r.id);
  const itemsRows = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  const itemsByOrderId = new Map<string, any[]>();
  for (const item of itemsRows) {
    const list = itemsByOrderId.get(item.orderId) || [];
    list.push({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: item.productName,
      variantColor: item.variantColor,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      createdAt: item.createdAt,
    });
    itemsByOrderId.set(item.orderId, list);
  }

  return rows.map((row) => ({
    ...row,
    items: itemsByOrderId.get(row.id) || [],
  }));
}
