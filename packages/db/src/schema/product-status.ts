import { pgTable, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';
import { productStatusEnum } from './enums.js';
import { product } from './products.js';

export const productStatus = pgTable('product_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => product.id, { onDelete: 'cascade' }),
  status: productStatusEnum('status').default('listed').notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProductStatus = typeof productStatus.$inferSelect;
export type NewProductStatus = typeof productStatus.$inferInsert;
