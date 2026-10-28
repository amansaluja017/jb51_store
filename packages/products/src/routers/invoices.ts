import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getInvoices,
  getPaginatedInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../invoices.js';
import { orderItemSchema } from './orders.js';

export const invoicesRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch all invoices' })
    .query(async () => {
      return await getInvoices();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated and filtered invoices' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          mode: z.enum(['all', 'cash', 'online', 'credit']).nullish(),
          sortBy: z.enum(['createdAt-desc', 'createdAt-asc', 'amount-desc', 'amount-asc']).nullish(),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedInvoices(input || undefined);
    }),

  create: adminProcedure
    .meta({ description: 'Create a new invoice (Admin only)' })
    .input(
      z.object({
        invoiceNumber: z.string().optional(),
        orderId: z.string().optional().nullable(),
        customerId: z.string().optional().nullable(),
        customerName: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        productId: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        quantity: z.number().optional(),
        mode: z.enum(['cash', 'online', 'credit']).optional(),
        subtotal: z.number().optional().nullable(),
        gst: z.number().optional().nullable(),
        taxRate: z.union([z.number(), z.string()]).optional().nullable(),
        discount: z.number().optional().nullable(),
        totalAmount: z.number().optional().nullable(),
        finalAmount: z.number().optional().nullable(),
        items: z.array(orderItemSchema).optional(),
        notes: z.string().optional().nullable(),
        paidAmount: z.union([z.number(), z.string()]).optional().nullable(),
        dueAmount: z.union([z.number(), z.string()]).optional().nullable(),
        dueDate: z.union([z.string(), z.date()]).optional().nullable(),
        advancePaymentMode: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createInvoice({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),

  update: adminProcedure
    .meta({ description: 'Update an existing invoice and propagate changes to its order (Admin only)' })
    .input(
      z.object({
        id: z.string(),
        customerId: z.string().optional().nullable(),
        customerName: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        productId: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        quantity: z.number().optional(),
        mode: z.enum(['cash', 'online', 'credit']).optional(),
        subtotal: z.number().optional().nullable(),
        gst: z.number().optional().nullable(),
        taxRate: z.union([z.number(), z.string()]).optional().nullable(),
        discount: z.number().optional().nullable(),
        totalAmount: z.number().optional().nullable(),
        finalAmount: z.number().optional().nullable(),
        items: z.array(orderItemSchema).optional(),
        notes: z.string().optional().nullable(),
        paidAmount: z.union([z.number(), z.string()]).optional().nullable(),
        dueAmount: z.union([z.number(), z.string()]).optional().nullable(),
        dueDate: z.union([z.string(), z.date()]).optional().nullable(),
        advancePaymentMode: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateInvoice({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),

  delete: adminProcedure
    .meta({ description: 'Delete an invoice by ID (Admin only)' })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteInvoice(input.id);
    }),
});
