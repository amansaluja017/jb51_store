import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { productStatusEnum } from './enums';
import { product } from './products';

export const productStatus = pgTable('product_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  status: productStatusEnum('status').default('listed').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProductStatus = typeof productStatus.$inferSelect;
export type NewProductStatus = typeof productStatus.$inferInsert;
