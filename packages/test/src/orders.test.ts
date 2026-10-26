import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, orders as ordersTable, orderItems as orderItemsTable, customerDetails as customerDetailsTable, invoices as invoicesTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { ordersRouter } from '@repo/products/router';
import {
  adminContext,
  unauthContext,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Orders Router and Controller Suite', () => {
  const createdOrderIds: string[] = [];
  const timestamp = Date.now();

  after(async () => {
    try {
      for (const id of createdOrderIds) {
        await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
        await db.delete(ordersTable).where(eq(ordersTable.id, id));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  it('getAll: should retrieve orders list', async () => {
    const caller = ordersRouter.createCaller(unauthContext);
    const orders = await caller.getAll();
    assert.strictEqual(Array.isArray(orders), true);
  });

  it('create: should reject unauthenticated caller', async () => {
    const unauthCaller = ordersRouter.createCaller(unauthContext);
    await assert.rejects(
      async () => {
        await unauthCaller.create({
          totalAmount: 15000,
          items: [
            {
              name: 'Silk Anarkali',
              quantity: 1,
              price: 15000,
              total: 15000,
            },
          ],
        });
      },
      (err: any) => err.code === 'UNAUTHORIZED'
    );
  });

  it('create: admin can successfully create order with items transformation', async () => {
    const adminCaller = ordersRouter.createCaller(adminContext);
    const order = await adminCaller.create({
      customerName: `Kavita Sen ${timestamp}`,
      phoneNumber: `+9191${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `kavita_${timestamp}@example.com`,
      address: '22 Park Street, Kolkata',
      status: 'pending',
      paymentMethod: 'online',
      subtotal: 25000,
      discount: 1000,
      totalAmount: 24000,
      paidAmount: 24000,
      dueAmount: 0,
      items: [
        {
          name: 'Georgette Sharara Set',
          quantity: 2,
          unitPrice: 12500,
          total: 25000,
        },
      ],
      notes: 'Boutique custom order',
    });

    assert.ok(order);
    assert.ok(order.id);
    createdOrderIds.push(order.id);

    assert.ok(order.orderNumber.startsWith('ORD-'));
    assert.strictEqual(Number(order.totalAmount), 24000);
    assert.strictEqual(order.status, 'pending');
  });

  it('create: order creation with credit due amount', async () => {
    const adminCaller = ordersRouter.createCaller(adminContext);
    const order = await adminCaller.create({
      customerName: `Sunita Varma ${timestamp}`,
      phoneNumber: `+9192${Math.floor(10000000 + Math.random() * 90000000)}`,
      subtotal: 18000,
      totalAmount: 18000,
      paidAmount: 8000,
      dueAmount: 10000,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      items: [
        {
          name: 'Chanderi Kurta Set',
          quantity: 1,
          price: 18000,
          total: 18000,
        },
      ],
    });

    assert.ok(order);
    assert.ok(order.id);
    createdOrderIds.push(order.id);
    assert.strictEqual(Number(order.totalAmount), 18000);
  });

  it('delete: admin can delete an order and verify associated invoice is also deleted', async () => {
    const adminCaller = ordersRouter.createCaller(adminContext);
    const order = await adminCaller.create({
      customerName: `Delete Test Customer ${timestamp}`,
      phoneNumber: `+9195${Math.floor(10000000 + Math.random() * 90000000)}`,
      totalAmount: 12000,
      paymentMethod: 'cash',
      items: [
        {
          name: 'Item to Delete',
          quantity: 1,
          price: 12000,
          total: 12000,
        },
      ],
    });

    assert.ok(order?.id);
    assert.ok(order.invoice?.id);

    // Verify invoice exists in DB
    const [invBefore] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, order.invoice.id));
    assert.ok(invBefore, 'Invoice should exist before order deletion');

    // Delete the order
    const result = await adminCaller.delete({ id: order.id });
    assert.ok(result.success);

    // Verify order is deleted
    const [ordAfter] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, order.id));
    assert.strictEqual(ordAfter, undefined, 'Order should be deleted from DB');

    // Verify invoice is also deleted
    const [invAfter] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, order.invoice.id));
    assert.strictEqual(invAfter, undefined, 'Invoice should also be deleted when order is deleted');
  });
});
