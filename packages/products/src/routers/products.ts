import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  getProducts,
  getPaginatedProducts,
  searchProducts,
  getProductSuggestions,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStatus,
  updateProductStatus,
  getCategories,
  reorderProductImages,
} from '../data.js';
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
  ReorderProductImagesInputSchema,
  ReorderProductImagesOutputSchema,
} from '../services/validations.js';

export const productsRouter = router({
  getAll: publicProcedure
    .meta({ description: 'Fetch all products for the storefront' })
    .output(GetAllProductsOutputSchema)
    .query(async () => {
      return await getProducts();
    }),

  getPaginated: publicProcedure
    .meta({ description: 'Fetch paginated, filtered, and sorted products' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          category: z.string().nullish(),
          filter: z.enum(['new', 'bestseller', 'all']).nullish(),
          inStockOnly: z.boolean().nullish(),
          sortBy: z
            .enum(['name-asc', 'name-desc', 'price-asc', 'price-desc', 'stock-desc', 'stock-asc', 'newest', 'default'])
            .nullish()
            .default('name-asc'),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(8),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedProducts(input || undefined);
    }),

  search: publicProcedure
    .meta({ description: 'Fast search products matching name, description, tags, fabric, category using ilike' })
    .input(
      z
        .object({
          query: z.string().nullish(),
          category: z.string().nullish(),
          inStockOnly: z.boolean().nullish(),
          sortBy: z
            .enum(['name-asc', 'name-desc', 'price-asc', 'price-desc', 'stock-desc', 'stock-asc', 'newest', 'default'])
            .nullish(),
          limit: z.number().int().positive().nullish().default(20),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await searchProducts(input || undefined);
    }),

  suggestions: publicProcedure
    .meta({ description: 'Real-time autocomplete suggestions for products, categories, and tags using pg_trgm' })
    .input(
      z.object({
        query: z.string().nullish(),
        limit: z.number().int().positive().nullish().default(8),
      })
    )
    .query(async ({ input }) => {
      return await getProductSuggestions(input.query || '', input.limit || 8);
    }),

  getBySlug: publicProcedure
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

  reorderImages: adminProcedure
    .meta({ description: 'Reorder product images (Admin only)' })
    .input(ReorderProductImagesInputSchema)
    .output(ReorderProductImagesOutputSchema)
    .mutation(async ({ input }) => {
      const updatedImages = await reorderProductImages(input.slug, input.images);
      return { success: true, images: updatedImages };
    }),

  delete: adminProcedure
    .meta({ description: 'Delete an existing product listing (Admin only)' })
    .input(DeleteProductInputSchema)
    .output(DeleteProductOutputSchema)
    .mutation(async ({ input }) => {
      return await deleteProduct(input.slug);
    }),

  getStatus: publicProcedure
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

  getCategories: publicProcedure
    .meta({ description: 'Fetch all product categories' })
    .query(async () => {
      return await getCategories();
    }),
});
