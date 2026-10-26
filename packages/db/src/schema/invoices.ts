import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { invoiceModeEnum } from './enums.js';
import { product } from './products.js';
import { user } from './users.js';
import { customerDetails } from './customer-details.js';
import { orders } from './orders.js';

export interface InvoiceItem {
  productId?: string | null;
  productVariantId?: string | null;
  productName: string;
  variantColor?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).unique(),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'cascade',
  }),
  customerId: uuid('customer_id').references(() => customerDetails.id, {
    onDelete: 'set null',
  }),
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
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  gst: numeric('gst', { precision: 10, scale: 2 }),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }),
  finalAmount: numeric('final_amount', { precision: 10, scale: 2 }),
  items: jsonb('items').$type<InvoiceItem[]>(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
