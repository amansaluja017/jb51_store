import {
  pgTable,
  uuid,
  numeric,
  timestamp,
  varchar,
  text,
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
  advancePaymentMode: varchar('advance_payment_mode', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  creditId: uuid('credit_id').references(() => credits.id, {
    onDelete: 'cascade',
  }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMode: varchar('payment_mode', { length: 50 }).notNull(), // 'cash', 'online', etc.
  transactionType: varchar('transaction_type', { length: 50 }).default('payment').notNull(), // 'advance', 'payment'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Credit = typeof credits.$inferSelect;
export type NewCredit = typeof credits.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

