import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const newsletter = pgTable(
  'newsletter',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    source: varchar('source', { length: 100 }).default('web_footer').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('newsletter_email_idx').on(table.email),
    emailTrgmIdx: index('newsletter_email_trgm_idx').using('gin', sql`${table.email} gin_trgm_ops`),
  })
);

export type NewsletterSubscriber = typeof newsletter.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletter.$inferInsert;

