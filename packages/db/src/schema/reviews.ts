import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  json,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './users';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  review: text('review'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  imageUrls: json('image_urls').$type<string[]>(),
  videoUrl: text('video_url'),
  adminId: uuid('admin_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
