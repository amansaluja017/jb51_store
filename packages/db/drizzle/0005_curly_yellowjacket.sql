ALTER TABLE "product" RENAME COLUMN "price" TO "selling_price";--> statement-breakpoint
UPDATE "product" SET "mrp" = "selling_price" WHERE "mrp" IS NULL;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "mrp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "hex_code" varchar(50);