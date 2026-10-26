import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, invoices as invoicesTable, orders as ordersTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { invoicesRouter, ordersRouter } from '@repo/products/router';
import {
  adminContext,
  unauthContext,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Invoices Router and Controller Suite', () => {
  const createdInvoiceIds: string[] = [];
  const timestamp = Date.now();

  after(async () => {
    try {
      for (const id of createdInvoiceIds) {
        await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  it('getAll: should retrieve invoices list', async () => {
    const caller = invoicesRouter.createCaller(unauthContext);
    const invoices = await caller.getAll();
    assert.strictEqual(Array.isArray(invoices), true);
  });

  it('create: should reject unauthenticated caller', async () => {
    const unauthCaller = invoicesRouter.createCaller(unauthContext);
    await assert.rejects(
      async () => {
        await unauthCaller.create({
          customerName: 'Test Client',
          totalAmount: 12000,
        });
      },
      (err: any) => err.code === 'UNAUTHORIZED'
    );
  });

  it('create: admin can create an invoice with mode cash/online', async () => {
    const adminCaller = invoicesRouter.createCaller(adminContext);
    const invoice = await adminCaller.create({
      customerName: `Ritu Singhania ${timestamp}`,
      phoneNumber: `+9193${Math.floor(10000000 + Math.random() * 90000000)}`,
      mode: 'online',
      subtotal: 15000,
      discount: 500,
      gst: 725,
      totalAmount: 15225,
      finalAmount: 15225,
      notes: 'Custom bridal fitting invoice',
    });

    assert.ok(invoice);
    assert.ok(invoice.id);
    createdInvoiceIds.push(invoice.id);

    assert.ok(invoice.invoiceNumber?.startsWith('INV-'));
    assert.strictEqual(invoice.mode, 'online');
    assert.strictEqual(Number(invoice.finalAmount), 15225);
  });

  it('create & getAll: admin can create credit invoice with due amount and verify getAll returns credit fields', async () => {
    const adminCaller = invoicesRouter.createCaller(adminContext);
    const invoice = await adminCaller.create({
      customerName: `Credit Client ${timestamp}`,
      phoneNumber: `+9194${Math.floor(10000000 + Math.random() * 90000000)}`,
      mode: 'credit',
      subtotal: 20000,
      totalAmount: 20000,
      finalAmount: 20000,
      paidAmount: 5000,
      dueAmount: 15000,
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      notes: 'Credit order with balance',
    });

    assert.ok(invoice);
    assert.ok(invoice.id);
    createdInvoiceIds.push(invoice.id);

    const allInvoices = await adminCaller.getAll();
    const found = allInvoices.find((i: any) => i.id === invoice.id);
    assert.ok(found, 'Created credit invoice should be found in getAll');
    assert.strictEqual(found?.mode, 'credit');
    assert.strictEqual(Number(found?.dueAmount), 15000);
    assert.strictEqual(Number(found?.paidAmount), 5000);
    assert.ok(found?.dueDate);
  });

  it('update: admin can update invoice and changes are reflected in the associated order', async () => {
    const adminCaller = invoicesRouter.createCaller(adminContext);
    const ordersCaller = ordersRouter.createCaller(adminContext);

    // 1. Create an order with an invoice
    const order = await ordersCaller.create({
      customerName: `Order Before Invoice Edit ${timestamp}`,
      phoneNumber: `+9196${Math.floor(10000000 + Math.random() * 90000000)}`,
      totalAmount: 10000,
      paymentMethod: 'cash',
      items: [
        {
          name: 'Original Item',
          quantity: 1,
          price: 10000,
          total: 10000,
        },
      ],
    });

    assert.ok(order?.id);
    assert.ok(order.invoice?.id);

    // 2. Edit the invoice
    const updatedInvoice = await adminCaller.update({
      id: order.invoice.id,
      customerName: `Updated Customer Name ${timestamp}`,
      totalAmount: 18500,
      finalAmount: 18500,
      mode: 'online',
      items: [
        {
          productName: 'Updated Custom Gown',
          quantity: 2,
          unitPrice: 9250,
          total: 18500,
        },
      ],
      notes: 'Customer changed requirements to 2 gowns',
    });

    assert.ok(updatedInvoice);
    assert.strictEqual(updatedInvoice.customerName, `Updated Customer Name ${timestamp}`);
    assert.strictEqual(updatedInvoice.mode, 'online');
    assert.strictEqual(Number(updatedInvoice.finalAmount), 18500);

    // 3. Verify changes were propagated to the order
    const [updatedOrder] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, order.id));

    assert.ok(updatedOrder);
    assert.strictEqual(updatedOrder.paymentMethod, 'online', 'Order paymentMethod should be updated to online');
    assert.strictEqual(Number(updatedOrder.totalAmount), 18500, 'Order totalAmount should be updated to 18500');
    assert.strictEqual(updatedOrder.notes, 'Customer changed requirements to 2 gowns');

    // Clean up order
    await ordersCaller.delete({ id: order.id });
  });

  it('delete: admin can delete an invoice by id', async () => {
    const adminCaller = invoicesRouter.createCaller(adminContext);
    const idToDelete = createdInvoiceIds.pop();
    if (!idToDelete) return;

    const deleted = await adminCaller.delete({ id: idToDelete });
    assert.ok(deleted);
  });
});
