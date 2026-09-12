ALTER TABLE "product_variant" ALTER COLUMN "color" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "product_variant" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "stock_qty";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "color";