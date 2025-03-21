CREATE TABLE "created_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_timestamp" text NOT NULL,
	"initial_amount" text NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"owner" text NOT NULL,
	"token" text NOT NULL
);
