import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, customerDetails as customerDetailsTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { customersRouter } from '@repo/products/router';
import {
  adminContext,
  customerContext,
  unauthContext,
  closeDatabaseConnection,
} from './helpers/test-context.js';

describe('Customers Router and Controller Suite', () => {
  const createdCustomerIds: string[] = [];
  const timestamp = Date.now();
  const testPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

  after(async () => {
    try {
      for (const id of createdCustomerIds) {
        await db.delete(customerDetailsTable).where(eq(customerDetailsTable.id, id));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  describe('Customer Listing and Pagination', () => {
    it('getAll: should retrieve all customers list', async () => {
      const caller = customersRouter.createCaller(unauthContext);
      const customers = await caller.getAll();
      assert.strictEqual(Array.isArray(customers), true);
    });

    it('getPaginated: should retrieve paginated customers', async () => {
      const caller = customersRouter.createCaller(unauthContext);
      const result = await caller.getPaginated({ page: 1, limit: 10 });
      assert.ok(result);
      assert.strictEqual(Array.isArray(result.items), true);
      assert.ok(typeof result.totalPages === 'number');
    });
  });

  describe('Customer CRUD Operations', () => {
    let customerId: string;

    it('create: should reject non-admin users', async () => {
      const unauthCaller = customersRouter.createCaller(unauthContext);
      await assert.rejects(
        async () => {
          await unauthCaller.create({
            name: 'Priya Mehra',
            phoneNumber: testPhone,
          });
        },
        (err: any) => err.code === 'UNAUTHORIZED'
      );
    });

    it('create: admin can successfully create a customer', async () => {
      const adminCaller = customersRouter.createCaller(adminContext);
      const created = await adminCaller.create({
        name: `Priya Mehra ${timestamp}`,
        phoneNumber: testPhone,
        email: `priya_${timestamp}@example.com`,
        address: '124 Civil Lines, Jaipur',
      });

      assert.ok(created);
      assert.ok(created.id);
      customerId = created.id;
      createdCustomerIds.push(customerId);

      assert.strictEqual(created.name, `Priya Mehra ${timestamp}`);
      assert.strictEqual(created.phoneNumber, testPhone);
      assert.ok(created.nameSlug);
    });

    it('update: admin can update customer details', async () => {
      const adminCaller = customersRouter.createCaller(adminContext);
      const updated = await adminCaller.update({
        id: customerId,
        address: '456 Heritage Enclave, Jaipur',
      });

      assert.ok(updated);
      assert.strictEqual(updated.address, '456 Heritage Enclave, Jaipur');
    });

    it('getOrderHistory: admin can fetch customer order metrics', async () => {
      const adminCaller = customersRouter.createCaller(adminContext);
      const history = await adminCaller.getOrderHistory({ customerId });

      assert.ok(history);
      assert.ok(history.customer);
      assert.strictEqual(history.customer.id, customerId);
      assert.strictEqual(Array.isArray(history.orders), true);
      assert.ok(typeof history.totalSpend === 'number');
      assert.ok(typeof history.totalOrders === 'number');
    });

    it('delete: admin can delete a customer', async () => {
      const adminCaller = customersRouter.createCaller(adminContext);
      const idToDelete = createdCustomerIds.pop();
      if (!idToDelete) return;

      const deleted = await adminCaller.delete({ id: idToDelete });
      assert.strictEqual(deleted.success, true);
    });
  });
});
