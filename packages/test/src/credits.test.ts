import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, credits as creditsTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { creditsRouter } from '@repo/products/router';
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

    it('delete: admin can delete credit record', async () => {
      const adminCaller = creditsRouter.createCaller(adminContext);
      const idToDelete = createdCreditIds.pop();
      if (!idToDelete) return;

      const deleted = await adminCaller.delete({ id: idToDelete });
      assert.strictEqual(deleted.success, true);
    });
  });
});
