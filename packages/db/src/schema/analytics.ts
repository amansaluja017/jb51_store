import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';

export const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  views: integer('views').default(0).notNull(),
  whatsappClicks: integer('whatsapp_clicks').default(0).notNull(),
  instagramClicks: integer('instagram_clicks').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
