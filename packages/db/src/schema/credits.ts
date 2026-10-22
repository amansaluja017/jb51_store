import {
  pgTable,
  uuid,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './users.js';
import { orders } from './orders.js';
import { invoices } from './invoices.js';

export const credits = pgTable('credits', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, {
    onDelete: 'set null',
  }),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  dueAmount: numeric('due_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Credit = typeof credits.$inferSelect;
export type NewCredit = typeof credits.$inferInsert;
