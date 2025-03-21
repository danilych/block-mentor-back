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
