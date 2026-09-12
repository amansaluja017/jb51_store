import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { product } from './products.js';

export const productAnalytics = pgTable('product_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  views: integer('views').default(0).notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type NewProductAnalytics = typeof productAnalytics.$inferInsert;
