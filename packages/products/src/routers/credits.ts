import { z } from 'zod';
import { router, adminProcedure } from './base.js';
import {
  getCredits,
  getPaginatedCredits,
  createCredit,
  updateCredit,
  recordCreditPayment,
  deleteCredit,
  getCreditTransactions,
} from '../credits.js';

export const creditsRouter = router({
  getAll: adminProcedure
    .meta({ description: 'Fetch all credits with joined order/invoice details and summary metrics' })
    .query(async () => {
      return await getCredits();
    }),

  getPaginated: adminProcedure
    .meta({ description: 'Fetch paginated and filtered credits' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          filterTab: z.enum(['all', 'pending', 'overdue', 'settled']).nullish(),
          sortBy: z.enum(['createdAt-desc', 'createdAt-asc', 'dueAmount-desc', 'dueDate-asc']).nullish(),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedCredits(input || undefined);
    }),

  create: adminProcedure
    .meta({ description: 'Record a new credit transaction (Admin only)' })
    .input(
      z.object({
        orderId: z.string().uuid().optional().nullable(),
        userId: z.string().uuid().optional().nullable(),
        invoiceId: z.string().uuid().optional().nullable(),
        paidAmount: z.number().nonnegative().default(0),
        dueAmount: z.number().nonnegative(),
        dueDate: z.string().optional().nullable(),
        advancePaymentMode: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createCredit({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),

  update: adminProcedure
    .meta({ description: 'Update a credit record (Admin only)' })
    .input(
      z.object({
        id: z.string().uuid(),
        orderId: z.string().uuid().optional().nullable(),
        userId: z.string().uuid().optional().nullable(),
        invoiceId: z.string().uuid().optional().nullable(),
        paidAmount: z.number().nonnegative().optional(),
        dueAmount: z.number().nonnegative().optional(),
        dueDate: z.string().optional().nullable(),
        advancePaymentMode: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateCredit(input);
    }),

  recordPayment: adminProcedure
    .meta({ description: 'Record a payment towards a credit (Admin only)' })
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive('Payment amount must be greater than 0'),
        paymentMode: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await recordCreditPayment({
        ...input,
        userId: ctx.user?.id || null,
      });
    }),

  getTransactions: adminProcedure
    .meta({ description: 'Fetch credit transactions history (Admin only)' })
    .input(
      z
        .object({
          creditId: z.string().uuid().optional().nullable(),
          invoiceId: z.string().uuid().optional().nullable(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getCreditTransactions(input?.creditId || undefined, input?.invoiceId || undefined);
    }),

  delete: adminProcedure
    .meta({ description: 'Delete a credit record (Admin only)' })
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await deleteCredit(input.id);
    }),
});
