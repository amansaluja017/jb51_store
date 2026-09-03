import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { wishlist } from './wishlist.js';
import { product } from './products.js';

export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  wishlistId: uuid('wishlist_id')
    .notNull()
    .references(() => wishlist.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
