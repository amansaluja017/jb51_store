import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getReviews,
  getReviewCounts,
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
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.isStaff || ctx.user?.role === 'admin' || ctx.user?.role === 'superadmin';
      if (input?.all && isAdmin) {
        return await getReviews();
      }
      return await getReviews(true);
    }),

  getModerationQueue: adminProcedure
    .meta({ description: 'Fetch all reviews for moderation (including unapproved) (Admin only)' })
    .query(async () => {
      return await getReviews();
    }),

  getCounts: adminProcedure
    .meta({ description: 'Fetch review counts breakdown (all, approved, pending) (Admin only)' })
    .query(async () => {
      return await getReviewCounts();
    }),

  getPaginated: adminProcedure
    .meta({ description: 'Fetch paginated reviews (Admin only)' })
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

  search: adminProcedure
    .meta({ description: 'Fast search reviews using ilike (Admin only)' })
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

  suggestions: adminProcedure
    .meta({ description: 'Real-time autocomplete suggestions for reviews using pg_trgm (Admin only)' })
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
      const isAdmin = ctx.isStaff || ctx.user?.role === 'admin' || ctx.user?.role === 'superadmin';
      return await createReview({
        ...input,
        approved: input.approved !== undefined ? input.approved : (isAdmin ? true : false),
      });
    }),

  update: adminProcedure
    .meta({ description: 'Update an existing review (Admin only)' })
    .input(UpdateReviewInputSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateReview(id, data);
    }),

  delete: adminProcedure
    .meta({ description: 'Delete an existing review (Admin only)' })
    .input(DeleteReviewInputSchema)
    .mutation(async ({ input }) => {
      return await deleteReview(input.id);
    }),
});
