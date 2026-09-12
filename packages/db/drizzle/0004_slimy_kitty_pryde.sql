ALTER TABLE "product" DROP CONSTRAINT "product_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventry" ALTER COLUMN "available_stock" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventry" ALTER COLUMN "reserved_stock" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventry" ALTER COLUMN "total_stock" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "mrp" numeric(10, 2);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
