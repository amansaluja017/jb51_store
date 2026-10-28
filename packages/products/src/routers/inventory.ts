import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from './base.js';
import {
  recordInventoryTransaction,
  getInventoryTransactions,
  getPaginatedInventory,
  updateInventory,
} from '../inventory.js';

const UpdateInventorySchema = z.object({
  productId: z.string().nullish(),
  slug: z.string().nullish(),
  status: z.enum(['listed', 'unListed', 'discontinued']).nullish(),
  variants: z
    .array(
      z.object({
        id: z.string().nullish(),
        productVariantId: z.string().nullish(),
        color: z.string().nullish(),
        size: z.string().nullish(),
        stock: z.number().int().min(0),
        reservedStock: z.number().int().min(0).nullish(),
      })
    )
    .nullish(),
  forceInStock: z.boolean().nullish(),
});

export const inventoryRouter = router({
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

  getTransactions: publicProcedure
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

  getPaginated: publicProcedure
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

  update: adminProcedure
    .meta({ description: 'Update inventory stock for product variants' })
    .input(UpdateInventorySchema)
    .mutation(async ({ input }) => {
      return await updateInventory(input);
    }),

  updateStock: adminProcedure
    .meta({ description: 'Update inventory stock for product variants (alias)' })
    .input(UpdateInventorySchema)
    .mutation(async ({ input }) => {
      return await updateInventory(input);
    }),
});
