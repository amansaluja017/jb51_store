import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { invoiceModeEnum } from './enums';
import { product } from './products';
import { user } from './users';

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  quantity: integer('quantity').default(1),
  mode: invoiceModeEnum('mode'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  gst: numeric('gst', { precision: 10, scale: 2 }),
  discount: numeric('discount', { precision: 10, scale: 2 }),
  finalAmount: numeric('final_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
