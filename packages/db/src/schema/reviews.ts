import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  json,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './users.js';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  review: text('review'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  imageUrls: json('image_urls').$type<string[]>(),
  videoUrl: text('video_url'),
  location: text('location'),
  instagramId: text('instagram_id'),
  approved: boolean('approved').default(false).notNull(),
  adminId: uuid('admin_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameTrgmIdx: index('reviews_name_trgm_idx').using('gin', sql`${table.customerName} gin_trgm_ops`),
  messageTrgmIdx: index('reviews_message_trgm_idx').using('gin', sql`${table.review} gin_trgm_ops`),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
