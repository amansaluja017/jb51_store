import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getOrders,
  getPaginatedOrders,
  createOrder,
  deleteOrder,
} from '../orders.js';

export const orderItemSchema = z
  .object({
    productId: z.string().optional().nullable(),
    productVariantId: z.string().optional().nullable(),
    productName: z.string().optional(),
    name: z.string().optional(),
    variantColor: z.string().optional().nullable(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().optional(),
    price: z.number().optional(),
    total: z.number(),
  })
  .transform((item) => ({
    productId: item.productId || null,
    productVariantId: item.productVariantId || null,
    productName: item.productName || item.name || 'Item',
    variantColor: item.variantColor || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice !== undefined ? item.unitPrice : (item.price ?? 0),
    total: item.total,
  }));

export const ordersRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch all orders' })
    .query(async () => {
      return await getOrders();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated and filtered orders' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          status: z.string().nullish(),
          sortBy: z.enum(['createdAt-desc', 'createdAt-asc', 'totalAmount-desc', 'totalAmount-asc']).nullish(),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedOrders(input || undefined);
    }),

  create: adminProcedure
    .meta({ description: 'Create a new customer order (Admin only)' })
    .input(
      z.object({
        orderNumber: z.string().optional(),
        invoiceNumber: z.string().optional(),
        customerId: z.string().optional().nullable(),
        customerName: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        status: z.string().optional(),
        orderType: z.string().optional(),
        paymentMethod: z.string().optional(),
        subtotal: z.number().optional().nullable(),
        gst: z.number().optional().nullable(),
        taxRate: z.union([z.number(), z.string()]).optional().nullable(),
        discount: z.number().optional().nullable(),
        totalAmount: z.number(),
        paidAmount: z.number().optional().nullable(),
        dueAmount: z.number().optional().nullable(),
        dueDate: z.string().optional().nullable(),
        advancePaymentMode: z.string().optional().nullable(),
        items: z.array(orderItemSchema),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createOrder({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),

  delete: adminProcedure
    .meta({ description: 'Delete an order and its associated invoice, reverting stock (Admin only)' })
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await deleteOrder(input.id);
    }),
});
