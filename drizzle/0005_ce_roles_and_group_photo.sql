CREATE TABLE "ce_profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"group_photo_url" varchar(500)
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'membre'::text;--> statement-breakpoint
UPDATE "users" SET "role" = CASE "role"
	WHEN 'editor' THEN 'president'
	WHEN 'viewer' THEN 'membre'
	ELSE "role"
END;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'president', 'membre');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'membre'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";