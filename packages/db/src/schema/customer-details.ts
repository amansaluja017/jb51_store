import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.js';

export const customerDetails = pgTable('customer_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  phoneNumber: text('phone_number'),
  email: text('email'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type CustomerDetails = typeof customerDetails.$inferSelect;
export type NewCustomerDetails = typeof customerDetails.$inferInsert;
