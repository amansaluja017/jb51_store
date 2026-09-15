import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './users.js';
import { customerDetails } from './customer-details.js';

export interface OrderItemInput {
  productId?: string | null;
  productVariantId?: string | null;
  productName: string;
  variantColor?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => customerDetails.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  status: varchar('status', { length: 50 }).default('confirmed').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('cash').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }),
  gst: numeric('gst', { precision: 10, scale: 2 }).default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
