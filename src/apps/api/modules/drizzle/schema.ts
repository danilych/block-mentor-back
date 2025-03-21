import { text, pgTable, uuid, pgEnum } from "drizzle-orm/pg-core";

export const lastCheckedBlockType = pgEnum("last_checked_block_type", [
  "TOKENS_FETCH",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  wallet: text("wallet").unique(),
});

export const lastCheckedBlocks = pgTable("last_checked_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: lastCheckedBlockType(),
  blockNumber: text("block_number").notNull(),
});

export const createdTokens = pgTable("created_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockTimestamp: text("block_timestamp").notNull(),
  initialAmount: text("initial_amount").notNull(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  owner: text("owner").notNull(),
  token_address: text("token").notNull(),
});
