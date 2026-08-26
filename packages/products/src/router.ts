import { initTRPC } from '@trpc/server';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from './data.js';
import { 
  GetAllProductsOutputSchema, 
  GetProductBySlugInputSchema, 
  GetProductBySlugOutputSchema,
  CreateProductInputSchema,
  CreateProductOutputSchema,
  UpdateProductInputSchema,
  UpdateProductOutputSchema,
  DeleteProductInputSchema,
  DeleteProductOutputSchema
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
