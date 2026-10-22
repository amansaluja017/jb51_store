import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getProducts, getPaginatedProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getProductStatus, updateProductStatus, getCategories, reorderProductImages } from './data.js';
import { getReviews, createReview, updateReview, deleteReview } from './reviews.js';
import { recordInventoryTransaction, getInventoryTransactions, getPaginatedInventory } from './inventory.js';
import { getCustomers, getPaginatedCustomers, createCustomer } from './customers.js';
import { getOrders, createOrder } from './orders.js';
import { getInvoices, createInvoice, deleteInvoice } from './invoices.js';
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
  DeleteReviewInputSchema,
  ReorderProductImagesInputSchema,
  ReorderProductImagesOutputSchema
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
  getPaginated: t.procedure
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
      return await createProduct(input as any);
    }),
  update: adminProcedure
    .meta({ description: 'Update an existing product listing (Admin only)' })
    .input(UpdateProductInputSchema)
    .output(UpdateProductOutputSchema)
    .mutation(async ({ input }) => {
      return await updateProduct(input.slug, input.data as any);
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
  getCategories: t.procedure
    .meta({ description: 'Fetch all product categories' })
    .query(async () => {
      return await getCategories();
    }),
});

export const reviewsRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch customer reviews' })
    .input(z.object({ all: z.boolean().nullish() }).nullish())
    .query(async ({ input }) => {
      if (input?.all) {
        return await getReviews();
      }
      return await getReviews(true);
    }),
  getModerationQueue: t.procedure
    .meta({ description: 'Fetch all reviews for moderation (including unapproved)' })
    .query(async () => {
      return await getReviews();
    }),
  create: t.procedure
    .meta({ description: 'Submit a new customer review' })
    .input(CreateReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.isStaff || ctx.user?.role === 'admin';
      return await createReview({
        ...input,
        approved: input.approved !== undefined ? input.approved : (isAdmin ? true : false),
      });
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

export const inventoryRouter = t.router({
  recordTransaction: adminProcedure
    .meta({ description: 'Record an inventory transaction (Sell or Purchase) with customer/supplier details' })
    .input(
      z.object({
        productId: z.string(),
        productVariantId: z.string().optional().nullable(),
        type: z.enum(['sale', 'purchase']),
        quantity: z.number().int().positive(),
        name: z.string().min(1, 'Name is required'),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        unitPrice: z.number().optional().nullable(),
        totalAmount: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return await recordInventoryTransaction(input);
    }),

  getTransactions: t.procedure
    .meta({ description: 'Fetch recent inventory transactions' })
    .input(
      z
        .object({
          productId: z.string().nullish(),
          limit: z.number().nullish(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getInventoryTransactions(input || undefined);
    }),

  getPaginated: t.procedure
    .meta({ description: 'Fetch paginated inventory items with stock filters and store-wide metrics' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          category: z.string().nullish(),
          stockFilter: z.enum(['all', 'inStock', 'outOfStock', 'lowStock', 'reserved']).nullish(),
          sortBy: z.enum(['default', 'name-asc', 'name-desc', 'stock-asc', 'stock-desc']).nullish(),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(8),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedInventory(input || undefined);
    }),
});

export const customersRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all customers from the database' })
    .query(async () => {
      return await getCustomers();
    }),
  getPaginated: t.procedure
    .meta({ description: 'Fetch paginated and sorted customers' })
    .input(
      z
        .object({
          search: z.string().nullish(),
          sortBy: z
            .enum(['name-asc', 'name-desc', 'createdAt-desc', 'createdAt-asc'])
            .nullish()
            .default('name-asc'),
          page: z.number().int().positive().nullish().default(1),
          limit: z.number().int().positive().nullish().default(8),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      return await getPaginatedCustomers(input || undefined);
    }),
  create: adminProcedure
    .meta({ description: 'Create a new customer (Admin only)' })
    .input(
      z.object({
        name: z.string().min(1, 'Customer name is required'),
        phoneNumber: z.string().min(1, 'Phone number is required'),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return await createCustomer({
        name: input.name,
        phoneNumber: input.phoneNumber,
        email: input.email,
        address: input.address,
      });
    }),
});

const orderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  productVariantId: z.string().optional().nullable(),
  productName: z.string().optional(),
  name: z.string().optional(),
  variantColor: z.string().optional().nullable(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().optional(),
  price: z.number().optional(),
  total: z.number(),
}).transform((item) => ({
  productId: item.productId || null,
  productVariantId: item.productVariantId || null,
  productName: item.productName || item.name || 'Item',
  variantColor: item.variantColor || null,
  quantity: item.quantity,
  unitPrice: item.unitPrice !== undefined ? item.unitPrice : (item.price ?? 0),
  total: item.total,
}));

export const ordersRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all orders' })
    .query(async () => {
      return await getOrders();
    }),
  create: adminProcedure
    .meta({ description: 'Create a new customer order (Admin only)' })
    .input(
      z.object({
        orderNumber: z.string().optional(),
        invoiceNumber: z.string().optional(),
        customerId: z.string().optional().nullable(),
        customerName: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        status: z.string().optional(),
        paymentMethod: z.string().optional(),
        subtotal: z.number().optional().nullable(),
        gst: z.number().optional().nullable(),
        discount: z.number().optional().nullable(),
        totalAmount: z.number(),
        items: z.array(orderItemSchema),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createOrder({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),
});

export const invoicesRouter = t.router({
  getAll: t.procedure
    .meta({ description: 'Fetch all invoices' })
    .query(async () => {
      return await getInvoices();
    }),
  create: adminProcedure
    .meta({ description: 'Create a new invoice (Admin only)' })
    .input(
      z.object({
        invoiceNumber: z.string().optional(),
        orderId: z.string().optional().nullable(),
        customerId: z.string().optional().nullable(),
        customerName: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        productId: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        quantity: z.number().optional(),
        mode: z.enum(['cash', 'online']).optional(),
        subtotal: z.number().optional().nullable(),
        gst: z.number().optional().nullable(),
        discount: z.number().optional().nullable(),
        totalAmount: z.number().optional().nullable(),
        finalAmount: z.number().optional().nullable(),
        items: z.array(orderItemSchema).optional(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createInvoice({
        ...input,
        userId: input.userId || ctx.user?.id || null,
      });
    }),
  delete: adminProcedure
    .meta({ description: 'Delete an invoice by ID (Admin only)' })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteInvoice(input.id);
    }),
});
