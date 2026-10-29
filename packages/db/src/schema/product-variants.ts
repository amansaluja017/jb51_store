import { pgTable, uuid, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
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
}, (table) => ({
  colorTrgmIdx: index('product_variant_color_trgm_idx').using('gin', sql`${table.color} gin_trgm_ops`),
}));

export type ProductVariantEntity = typeof productVariant.$inferSelect;
export type NewProductVariantEntity = typeof productVariant.$inferInsert;
