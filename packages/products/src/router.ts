import { initTRPC } from '@trpc/server';
import { getProducts, getProductBySlug } from './data.js';
import { 
  GetAllProductsOutputSchema, 
  GetProductBySlugInputSchema, 
  GetProductBySlugOutputSchema 
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
});
