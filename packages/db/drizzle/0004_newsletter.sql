CREATE TABLE IF NOT EXISTS "newsletter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(100) DEFAULT 'web_footer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_email_unique" UNIQUE("email")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_email_idx" ON "newsletter" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_email_trgm_idx" ON "newsletter" USING gin ("email" gin_trgm_ops);

