import {
  db,
  orders as ordersTable,
  orderItems as orderItemsTable,
  customerDetails as customerDetailsTable,
  OrderItemInput,
} from '@repo/db';
import { desc, eq, inArray } from 'drizzle-orm';

export interface CreateOrderInput {
  orderNumber?: string;
  customerId?: string | null;
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

  return await db.transaction(async (tx) => {
    // 1. Insert order header
    const [order] = await tx
      .insert(ordersTable)
      .values({
        orderNumber,
        customerId: input.customerId || null,
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

    // 2. Insert line items into order_items table
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
