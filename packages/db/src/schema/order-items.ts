import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { orders } from './orders.js';
import { product } from './products.js';
import { productVariant } from './product-variants.js';

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'set null',
  }),
  productVariantId: uuid('product_variant_id').references(
    () => productVariant.id,
    { onDelete: 'set null' }
  ),
  productName: varchar('product_name', { length: 255 }).notNull(),
  variantColor: varchar('variant_color', { length: 100 }),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrderItemRow = typeof orderItems.$inferInsert;
