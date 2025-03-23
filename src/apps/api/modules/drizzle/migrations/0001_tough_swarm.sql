CREATE TABLE "vestings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_timestamp" text NOT NULL,
	"token_address" text NOT NULL,
	"token_name" text NOT NULL,
	"token_ticker" text NOT NULL,
	"owner" text NOT NULL,
	"amount" text NOT NULL,
	"total_periods" integer NOT NULL,
	"period_duration" integer NOT NULL,
	"start_timestamp" text NOT NULL
);
