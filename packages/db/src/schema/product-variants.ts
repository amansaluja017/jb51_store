import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { product } from './products.js';

export const productVariant = pgTable('product_variant', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'cascade',
  }),
  color: varchar('color', {length: 100}).notNull(),
  hexCode: varchar('hex_code', {length: 50}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type ProductVariantEntity = typeof productVariant.$inferSelect;
export type NewProductVariantEntity = typeof productVariant.$inferInsert;
