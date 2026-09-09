import { initTRPC, TRPCError } from '@trpc/server';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getProductStatus, updateProductStatus } from './data.js';
import { getReviews, createReview, updateReview, deleteReview } from './reviewsData.js';
import { 
  GetAllProductsOutputSchema, 
  GetProductBySlugInputSchema, 
  GetProductBySlugOutputSchema,
  CreateProductInputSchema,
  CreateProductOutputSchema,
  UpdateProductInputSchema,
  UpdateProductOutputSchema,
  DeleteProductInputSchema,
  DeleteProductOutputSchema,
  GetProductStatusInputSchema,
  GetProductStatusOutputSchema,
  UpdateProductStatusInputSchema,
  UpdateProductStatusOutputSchema,
  CreateReviewInputSchema,
  UpdateReviewInputSchema,
  DeleteReviewInputSchema
} from './services/validations.js';

export interface RouteMeta {
  description?: string;
}

export interface TRPCContext {
  user?: { id?: string; email?: string; userName?: string; role?: string } | null;
  isStaff?: boolean;
}

const t = initTRPC.context<TRPCContext>().meta<RouteMeta>().create();

const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.isStaff) return next();
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication token required',
    });
  }
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: Admin role required',
    });
  }
  return next();
});

export const productsRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all products for the storefront' })
    .output(GetAllProductsOutputSchema)
    .query(async () => {
      return await getProducts();
    }),
  getBySlug: t.procedure
    .meta({ description: 'Fetch a single product by its unique slug' })
    .input(GetProductBySlugInputSchema)
    .output(GetProductBySlugOutputSchema)
    .query(async ({ input }) => {
      return await getProductBySlug(input.slug);
    }),
  create: adminProcedure
    .meta({ description: 'Create a new product listing (Admin only)' })
    .input(CreateProductInputSchema)
    .output(CreateProductOutputSchema)
    .mutation(async ({ input }) => {
      return await createProduct(input);
    }),
  update: adminProcedure
    .meta({ description: 'Update an existing product listing (Admin only)' })
    .input(UpdateProductInputSchema)
    .output(UpdateProductOutputSchema)
    .mutation(async ({ input }) => {
      return await updateProduct(input.slug, input.data);
    }),
  delete: adminProcedure
    .meta({ description: 'Delete an existing product listing (Admin only)' })
    .input(DeleteProductInputSchema)
    .output(DeleteProductOutputSchema)
    .mutation(async ({ input }) => {
      return await deleteProduct(input.slug);
    }),
  getStatus: t.procedure
    .meta({ description: 'Fetch product status by product slug' })
    .input(GetProductStatusInputSchema)
    .output(GetProductStatusOutputSchema)
    .query(async ({ ctx, input }) => {
      const statusData = await getProductStatus(input.slug);
      if (!statusData) return null;
      const isAdmin = ctx.user?.role === 'admin' || ctx.isStaff;
      if (!isAdmin && (statusData.status === 'unListed' || statusData.status === 'discontinued')) {
        return null;
      }
      return statusData;
    }),
  updateStatus: adminProcedure
    .meta({ description: 'Update product status (Admin only)' })
    .input(UpdateProductStatusInputSchema)
    .output(UpdateProductStatusOutputSchema)
    .mutation(async ({ input }) => {
      return await updateProductStatus(input.slug, { status: input.status, inStock: input.inStock });
    }),
});

export const reviewsRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all customer reviews' })
    .query(async () => {
      const reviews = await getReviews();
      return reviews
        .filter(r => r.approved)
        .map(({ phone, instagramId, ...rest }) => rest);
    }),
  getModerationQueue: adminProcedure
    .meta({ description: 'Fetch all reviews for moderation (including unapproved)' })
    .query(async () => {
      return await getReviews();
    }),
  create: t.procedure
    .meta({ description: 'Submit a new customer review' })
    .input(CreateReviewInputSchema)
    .mutation(async ({ input }) => {
      return await createReview(input);
    }),
  update: adminProcedure
    .meta({ description: 'Update an existing review' })
    .input(UpdateReviewInputSchema)
    .mutation(async ({ input }) => {
      return await updateReview(input.id, { approved: input.approved });
    }),
  delete: adminProcedure
    .meta({ description: 'Delete an existing review' })
    .input(DeleteReviewInputSchema)
    .mutation(async ({ input }) => {
      return await deleteReview(input.id);
    }),
});
