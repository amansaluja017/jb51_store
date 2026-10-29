import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  json,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { category } from './categories.js';

export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  mrp: numeric('mrp', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id')
    .references(() => category.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  tags: json('tags').$type<string[]>(),
  features: json('features').$type<Record<string, any> | string[]>(),
  additionalInformation: json('additional_information').$type<Record<string, any>>(),
  isBestSeller: boolean('is_best_seller').default(false).notNull(),
  isLatest: boolean('is_latest').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  nameTrgmIdx: index('product_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`),
  descTrgmIdx: index('product_description_trgm_idx').using('gin', sql`${table.description} gin_trgm_ops`),
  tagsTrgmIdx: index('product_tags_trgm_idx').using('gin', sql`(${table.tags}::text) gin_trgm_ops`),
}));

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
