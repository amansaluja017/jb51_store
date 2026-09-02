import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { inqueryTypeEnum, inqueryStatusEnum } from './enums';

export const inqueries = pgTable('inqueries', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  message: text('message'),
  inqueryType: inqueryTypeEnum('inquery_type'),
  status: inqueryStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Inquery = typeof inqueries.$inferSelect;
export type NewInquery = typeof inqueries.$inferInsert;
