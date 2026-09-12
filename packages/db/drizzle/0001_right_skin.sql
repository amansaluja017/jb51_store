DO $$ BEGIN
 CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'reservation', 'release', 'return', 'adjustment');
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
DO $$ BEGIN
 ALTER TYPE "product_status_enum" ADD VALUE 'discontinued';
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"product_variant_id" uuid,
	"available_stock" integer DEFAULT 0,
	"reserved_stock" integer DEFAULT 0,
	"total_stock" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventry_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"product_variant_id" uuid,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "token" ADD COLUMN IF NOT EXISTS "token_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "token" ADD COLUMN IF NOT EXISTS "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "product_status" ADD COLUMN IF NOT EXISTS "in_stock" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventry" ADD CONSTRAINT "inventry_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventry" ADD CONSTRAINT "inventry_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventry_transaction" ADD CONSTRAINT "inventry_transaction_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventry_transaction" ADD CONSTRAINT "inventry_transaction_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_user_name_unique" UNIQUE("user_name");
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_status" ADD CONSTRAINT "product_status_product_id_unique" UNIQUE("product_id");
EXCEPTION
 WHEN OTHERS THEN null;
END $$;