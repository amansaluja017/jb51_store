import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from '../newsletter.js';

export const newsletterRouter = router({
  subscribe: publicProcedure
    .meta({ description: 'Subscribe an email address to the JB51 newsletter' })
    .input(
      z.object({
        email: z.string().email('Please enter a valid email address'),
        source: z.string().optional().default('web_footer'),
      })
    )
    .mutation(async ({ input }) => {
      return await subscribeNewsletter(input);
    }),

  unsubscribe: publicProcedure
    .meta({ description: 'Unsubscribe an email address from the newsletter' })
    .input(
      z.object({
        email: z.string().email('Please enter a valid email address'),
      })
    )
    .mutation(async ({ input }) => {
      return await unsubscribeNewsletter(input.email);
    }),

  getSubscribers: adminProcedure
    .meta({ description: 'Fetch paginated newsletter subscribers (Admin only)' })
    .input(
      z
        .object({
          page: z.number().int().positive().optional().default(1),
          limit: z.number().int().positive().optional().default(20),
          query: z.string().optional(),
          activeOnly: z.boolean().optional().default(false),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getNewsletterSubscribers(input);
    }),

  deleteSubscriber: adminProcedure
    .meta({ description: 'Delete a newsletter subscriber record (Admin only)' })
    .input(
      z.object({
        idOrEmail: z.string().min(1, 'Subscriber ID or email is required'),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteNewsletterSubscriber(input.idOrEmail);
    }),
});

