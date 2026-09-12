import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { product } from './products.js';
import { productVariant } from './product-variants.js';

export const inventry = pgTable('inventry', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'cascade',
  }),
  productVariant: uuid('product_variant_id').references(() => productVariant.id, {
    onDelete: 'cascade',
  }),
  availableStock: integer('available_stock').default(0).notNull(),
  reservedStock: integer('reserved_stock').default(0).notNull(),
  totalStock: integer('total_stock').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Inventry = typeof inventry.$inferSelect;
export type NewInventry = typeof inventry.$inferInsert;
