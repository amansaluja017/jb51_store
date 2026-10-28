import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getCustomers,
  getPaginatedCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../customers.js';
import { getCustomerOrderHistory } from '../orders.js';

export const customersRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch all customers from the database' })
    .query(async () => {
      return await getCustomers();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated and sorted customers' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          sortBy: z
            .enum(['name-asc', 'name-desc', 'createdAt-desc', 'createdAt-asc'])
            .nullish()
            .default('name-asc'),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(8),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedCustomers(input || undefined);
    }),

  create: adminProcedure
    .meta({ description: 'Create a new customer (Admin only)' })
    .input(
      z.object({
        name: z.string().min(1, 'Customer name is required'),
        phoneNumber: z.string().min(1, 'Phone number is required'),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return await createCustomer({
        name: input.name,
        phoneNumber: input.phoneNumber,
        email: input.email,
        address: input.address,
      });
    }),

  update: adminProcedure
    .meta({ description: 'Update an existing customer (Admin only)' })
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, 'Customer name is required').optional(),
        phoneNumber: z.string().min(1, 'Phone number is required').optional(),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateCustomer(input);
    }),

  delete: adminProcedure
    .meta({ description: 'Delete a customer (Admin only)' })
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await deleteCustomer(input.id);
    }),

  getOrderHistory: adminProcedure
    .meta({ description: 'Fetch a customer order history with computed metrics (Admin only)' })
    .input(z.object({ customerId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await getCustomerOrderHistory(input.customerId);
    }),
});
