import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const wishlist = pgTable('wishlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  fingerprint: text('fingerprint'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type NewWishlist = typeof wishlist.$inferInsert;
