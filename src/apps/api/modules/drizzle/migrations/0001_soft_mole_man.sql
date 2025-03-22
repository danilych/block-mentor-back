ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "public"."messages" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."message_roles";--> statement-breakpoint
CREATE TYPE "public"."message_roles" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
ALTER TABLE "public"."messages" ALTER COLUMN "role" SET DATA TYPE "public"."message_roles" USING "role"::"public"."message_roles";