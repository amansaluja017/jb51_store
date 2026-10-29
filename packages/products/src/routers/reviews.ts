import { z } from 'zod';
import { router, publicProcedure } from './base.js';
import {
  getReviews,
  getPaginatedReviews,
  searchReviews,
  getReviewSuggestions,
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

  search: publicProcedure
    .meta({ description: 'Fast search reviews using ilike' })
    .input(
      z
        .object({
          query: z.string().nullish(),
          approved: z.boolean().nullish(),
          limit: z.number().int().positive().nullish().default(20),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await searchReviews(input || undefined);
    }),

  suggestions: publicProcedure
    .meta({ description: 'Real-time autocomplete suggestions for reviews using pg_trgm' })
    .input(
      z.object({
        query: z.string().nullish(),
        limit: z.number().int().positive().nullish().default(8),
      })
    )
    .query(async ({ input }) => {
      return await getReviewSuggestions(input.query || '', input.limit || 8);
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
