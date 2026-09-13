import { pgTable, uuid, integer, timestamp, numeric, text } from 'drizzle-orm/pg-core';
import { inventoryTransactionTypeEnum } from './enums.js';
import { product } from './products.js';
import { productVariant } from './product-variants.js';
import { customerDetails } from './customer-details.js';
import { user } from './users.js';

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
  customerId: uuid('customer_id').references(() => customerDetails.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InventryTransaction = typeof inventryTransaction.$inferSelect;
export type NewInventryTransaction = typeof inventryTransaction.$inferInsert;

