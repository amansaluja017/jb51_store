import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, credits as creditsTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { creditsRouter, invoicesRouter, ordersRouter } from '@repo/products/router';
import {
  adminContext,
  customerContext,
  unauthContext,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Credits Router and Controller Suite', () => {
  const createdCreditIds: string[] = [];

  after(async () => {
    try {
      for (const id of createdCreditIds) {
        await db.delete(creditsTable).where(eq(creditsTable.id, id));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  describe('Credits Access Permissions', () => {
    it('getAll: should reject non-admin users', async () => {
      const unauthCaller = creditsRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.getAll();
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );

      const customerCaller = creditsRouter.createCaller(customerContext);
      await assert.rejects(
        async () => {
          await customerCaller.getAll();
        },
        (err: any) => err.code === 'FORBIDDEN'
      );
    });

    it('getAll: should return credits list for admin', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const result = await adminCaller.getAll();

      assert.ok(result);
      assert.strictEqual(Array.isArray(result.credits), true);
      assert.ok(typeof result.metrics.totalDue === 'number');
      assert.ok(typeof result.metrics.totalPaid === 'number');
    });
  });

  describe('Credit Management Lifecycle', () => {
    let creditId: string;

    it('create: admin can record a new credit entry', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const created = await adminCaller.create({
        paidAmount: 5000,
        dueAmount: 15000,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      assert.ok(created);
      assert.ok(created.id);
      creditId = created.id;
      createdCreditIds.push(creditId);

      assert.strictEqual(Number(created.paidAmount), 5000);
      assert.strictEqual(Number(created.dueAmount), 15000);
    });

    it('update: admin can update credit amounts', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const updated = await adminCaller.update({
        id: creditId,
        dueAmount: 14000,
      });

      assert.ok(updated);
      assert.strictEqual(Number(updated.dueAmount), 14000);
    });

    it('recordPayment: should record installment payment towards due balance', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const paymentResult = await adminCaller.recordPayment({
        id: creditId,
        amount: 4000,
      });

      assert.ok(paymentResult);
      assert.strictEqual(Number(paymentResult.paidAmount), 9000); // 5000 + 4000
      assert.strictEqual(Number(paymentResult.dueAmount), 10000); // 14000 - 4000
    });

    it('end-to-end credit flow: 20000 total with 8000 advance cash, then 5000 subsequent payment', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const invoiceCaller = invoicesRouter.createCaller(adminContext);

      // 1. Create invoice with credit payment: Total 20,000, 8,000 advance in cash, due 12,000
      const invNumber = `INV-TEST-${Date.now()}`;
      const invoice = await invoiceCaller.create({
        invoiceNumber: invNumber,
        customerName: 'Customer A',
        phoneNumber: '+919876543210',
        mode: 'credit',
        totalAmount: 20000,
        finalAmount: 20000,
        paidAmount: 8000,
        dueAmount: 12000,
        advancePaymentMode: 'cash',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        items: [
          {
            productName: 'Designer Silk Sherwani',
            quantity: 1,
            unitPrice: 20000,
            total: 20000,
          },
        ],
      });

      assert.ok(invoice);
      assert.ok(invoice.id);

      // 2. Verify credit was created with advance payment mode = 'cash'
      const allCreditsRes = await adminCaller.getAll();
      const creditRow = allCreditsRes.credits.find((c: any) => c.invoiceId === invoice.id);
      assert.ok(creditRow);
      createdCreditIds.push(creditRow.id);

      assert.strictEqual(Number(creditRow.paidAmount), 8000);
      assert.strictEqual(Number(creditRow.dueAmount), 12000);
      assert.strictEqual(creditRow.advancePaymentMode, 'cash');
      assert.strictEqual(creditRow.transactions?.length, 1);
      assert.strictEqual(Number(creditRow.transactions[0].amount), 8000);
      assert.strictEqual(creditRow.transactions[0].paymentMode, 'cash');
      assert.strictEqual(creditRow.transactions[0].transactionType, 'advance');

      // 3. User later pays 5000 before due date with paymentMode online
      const paymentRes = await adminCaller.recordPayment({
        id: creditRow.id,
        amount: 5000,
        paymentMode: 'online',
        notes: 'Partial settlement before due date',
      });

      assert.ok(paymentRes);
      assert.strictEqual(Number(paymentRes.paidAmount), 13000); // 8000 + 5000
      assert.strictEqual(Number(paymentRes.dueAmount), 7000); // 12000 - 5000
      assert.ok(paymentRes.transaction);
      assert.strictEqual(Number(paymentRes.transaction.amount), 5000);
      assert.strictEqual(paymentRes.transaction.paymentMode, 'online');
      assert.strictEqual(paymentRes.transaction.transactionType, 'payment');

      // 4. Verify invoice reflects updated payments and transactions list
      const invoicesList = await invoiceCaller.getAll();
      const updatedInv = invoicesList.find((i: any) => i.id === invoice.id || i.invoiceNumber === invNumber);
      assert.ok(updatedInv);
      assert.strictEqual(Number(updatedInv.paidAmount), 13000);
      assert.strictEqual(Number(updatedInv.dueAmount), 7000);
      assert.strictEqual(Array.isArray(updatedInv.creditTransactions), true);
      assert.strictEqual(updatedInv.creditTransactions.length, 2);
    });

    it('delete: admin can delete credit record', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const idToDelete = createdCreditIds.pop();
      if (!idToDelete) return;

      const deleted = await adminCaller.delete({ id: idToDelete });
      assert.strictEqual(deleted.success, true);
    });
  });
});
