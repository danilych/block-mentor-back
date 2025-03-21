CREATE TYPE "public"."last_checked_block_type" AS ENUM('TOKENS_FETCH');--> statement-breakpoint
CREATE TABLE "last_checked_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "last_checked_block_type",
	"block_number" text NOT NULL
);
