import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { inqueryTypeEnum, inqueryStatusEnum } from './enums.js';

export const inqueries = pgTable('inqueries', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  message: text('message'),
  productName: varchar('product_name', { length: 255 }),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  channel: varchar('channel', { length: 50 }).default('Web'),
  inqueryType: inqueryTypeEnum('inquery_type'),
  status: inqueryStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  customerNameTrgmIdx: index('inqueries_customer_name_trgm_idx').using('gin', sql`${table.customerName} gin_trgm_ops`),
  messageTrgmIdx: index('inqueries_message_trgm_idx').using('gin', sql`${table.message} gin_trgm_ops`),
  phoneNumberTrgmIdx: index('inqueries_phone_number_trgm_idx').using('gin', sql`${table.phoneNumber} gin_trgm_ops`),
  productNameTrgmIdx: index('inqueries_product_name_trgm_idx').using('gin', sql`${table.productName} gin_trgm_ops`),
}));

export type Inquery = typeof inqueries.$inferSelect;
export type NewInquery = typeof inqueries.$inferInsert;
