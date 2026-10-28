import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getInquiries,
  getPaginatedInquiries,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from '../inquiries.js';

export const inquiriesRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch all customer inquiries' })
    .query(async () => {
      return await getInquiries();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated inquiries with sort and search options' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          status: z.enum(['all', 'pending', 'responded', 'resolved']).nullish(),
          sortBy: z.enum(['recent', 'oldest', 'name-asc', 'name-desc']).nullish().default('recent'),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedInquiries(input || undefined);
    }),

  create: publicProcedure
    .meta({ description: 'Create a new customer inquiry from Web Contact form or Mobile' })
    .input(
      z.object({
        customerName: z.string().min(1, 'Name is required'),
        phoneNumber: z.string().nullish(),
        email: z.string().nullish(),
        message: z.string().min(1, 'Message is required'),
        inqueryType: z.enum(['general', 'sales', 'support', 'product', 'other']).nullish(),
        productName: z.string().nullish(),
        size: z.string().nullish(),
        color: z.string().nullish(),
        channel: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      return await createInquiry({
        customerName: input.customerName,
        phoneNumber: input.phoneNumber,
        email: input.email,
        message: input.message,
        inqueryType: input.inqueryType,
        productName: input.productName,
        size: input.size,
        color: input.color,
        channel: input.channel || 'Web',
      });
    }),

  updateStatus: publicProcedure
    .meta({ description: 'Update status of an inquiry' })
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['pending', 'responded', 'resolved']),
      })
    )
    .mutation(async ({ input }) => {
      return await updateInquiryStatus(input.id, input.status);
    }),

  delete: adminProcedure
    .meta({ description: 'Delete an inquiry' })
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await deleteInquiry(input.id);
    }),
});
