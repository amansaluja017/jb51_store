import { initTRPC } from '@trpc/server';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from './data.js';
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
  CreateReviewInputSchema,
  UpdateReviewInputSchema,
  DeleteReviewInputSchema
} from './services/validations.js';

export interface RouteMeta {
  description?: string;
}

const t = initTRPC.meta<RouteMeta>().create();

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
  create: t.procedure
    .meta({ description: 'Create a new product listing' })
    .input(CreateProductInputSchema)
    .output(CreateProductOutputSchema)
    .mutation(async ({ input }) => {
      return await createProduct(input);
    }),
  update: t.procedure
    .meta({ description: 'Update an existing product listing' })
    .input(UpdateProductInputSchema)
    .output(UpdateProductOutputSchema)
    .mutation(async ({ input }) => {
      return await updateProduct(input.slug, input.data);
    }),
  delete: t.procedure
    .meta({ description: 'Delete an existing product listing' })
    .input(DeleteProductInputSchema)
    .output(DeleteProductOutputSchema)
    .mutation(async ({ input }) => {
      return await deleteProduct(input.slug);
    }),
});

export const reviewsRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all customer reviews' })
    .query(async () => {
      return await getReviews();
    }),
  create: t.procedure
    .meta({ description: 'Submit a new customer review' })
    .input(CreateReviewInputSchema)
    .mutation(async ({ input }) => {
      return await createReview(input);
    }),
  update: t.procedure
    .meta({ description: 'Update an existing review' })
    .input(UpdateReviewInputSchema)
    .mutation(async ({ input }) => {
      return await updateReview(input.id, { approved: input.approved });
    }),
  delete: t.procedure
    .meta({ description: 'Delete an existing review' })
    .input(DeleteReviewInputSchema)
    .mutation(async ({ input }) => {
      return await deleteReview(input.id);
    }),
});

