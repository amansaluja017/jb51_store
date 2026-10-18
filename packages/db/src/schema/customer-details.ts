import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './users.js';

export const customerDetails = pgTable(
  'customer_details',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    nameSlug: varchar('name_slug', { length: 255 }).notNull(),
    phoneNumber: text('phone_number').notNull(),
    email: text('email'),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    nameSlugPhoneIdx: uniqueIndex('customer_details_name_slug_phone_idx').on(
      table.nameSlug,
      table.phoneNumber
    ),
  })
);

export type CustomerDetails = typeof customerDetails.$inferSelect;
export type NewCustomerDetails = typeof customerDetails.$inferInsert;
