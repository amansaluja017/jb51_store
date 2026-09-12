import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { inventoryTransactionTypeEnum } from './enums.js';
import { product } from './products.js';
import { productVariant } from './product-variants.js';

export const inventryTransaction = pgTable('inventry_transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'cascade',
  }),
  productVariant: uuid('product_variant_id').references(() => productVariant.id, {
    onDelete: 'cascade',
  }),
  type: inventoryTransactionTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InventryTransaction = typeof inventryTransaction.$inferSelect;
export type NewInventryTransaction = typeof inventryTransaction.$inferInsert;
