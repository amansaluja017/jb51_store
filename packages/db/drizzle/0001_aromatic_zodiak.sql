ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_name_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "customer_details" ADD COLUMN IF NOT EXISTS "name_slug" varchar(255);--> statement-breakpoint
UPDATE "customer_details" SET "name_slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g')) WHERE "name_slug" IS NULL;--> statement-breakpoint
ALTER TABLE "customer_details" ALTER COLUMN "phone_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_details" ALTER COLUMN "name_slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customer_details_name_slug_phone_idx" ON "customer_details" USING btree ("name_slug","phone_number");