import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  json,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { category } from './categories';

export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stockQty: integer('stock_qty').default(0).notNull(),
  color: varchar('color', { length: 100 }),
  categoryId: uuid('category_id').references(() => category.id, {
    onDelete: 'set null',
  }),
  tags: json('tags').$type<string[]>(),
  features: json('features').$type<Record<string, any> | string[]>(),
  aditionalImformation: json('aditional_imformation').$type<Record<string, any>>(),
  isBestSeller: boolean('is_best_seller').default(false).notNull(),
  isLatest: boolean('is_latest').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
