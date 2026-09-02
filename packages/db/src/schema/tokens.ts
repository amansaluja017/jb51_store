import { pgTable, uuid, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { tokenTypeEnum } from './enums';
import { user } from './users';

export const token = pgTable('token', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tokenType: tokenTypeEnum('token_type').notNull(),
  tokenHash: text('token_hash').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Token = typeof token.$inferSelect;
export type NewToken = typeof token.$inferInsert;
