import { z } from 'zod';
import { router, publicProcedure } from './base.js';
import {
  getReviews,
  getPaginatedReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../reviews.js';
import {
  CreateReviewInputSchema,
  UpdateReviewInputSchema,
  DeleteReviewInputSchema,
} from '../services/validations.js';

export const reviewsRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch customer reviews' })
    .input(z.object({ all: z.boolean().nullish() }).nullish())
    .query(async ({ input }) => {
      if (input?.all) {
        return await getReviews();
      }
      return await getReviews(true);
    }),

  getModerationQueue: publicProcedure
    .meta({ description: 'Fetch all reviews for moderation (including unapproved)' })
    .query(async () => {
      return await getReviews();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated reviews' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          approved: z.boolean().nullish(),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(10),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedReviews(input || undefined);
    }),

  create: publicProcedure
    .meta({ description: 'Submit a new customer review' })
    .input(CreateReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.isStaff || ctx.user?.role === 'admin';
      return await createReview({
        ...input,
        approved: input.approved !== undefined ? input.approved : (isAdmin ? true : false),
      });
    }),

  update: publicProcedure
    .meta({ description: 'Update an existing review' })
    .input(UpdateReviewInputSchema)
    .mutation(async ({ input }) => {
      return await updateReview(input.id, { approved: input.approved });
    }),

  delete: publicProcedure
    .meta({ description: 'Delete an existing review' })
    .input(DeleteReviewInputSchema)
    .mutation(async ({ input }) => {
      return await deleteReview(input.id);
    }),
});
