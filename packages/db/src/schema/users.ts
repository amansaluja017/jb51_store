import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums.js';

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  userName: varchar('user_name', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('customer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
