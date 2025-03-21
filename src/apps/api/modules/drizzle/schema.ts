import { text, pgTable, uuid, pgEnum, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const lastCheckedBlockType = pgEnum("last_checked_block_type", [
  "TOKENS_FETCH",
]);

export const messageRoles = pgEnum("message_roles", [
  "USER",
  "AGENT"
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  wallet: text("wallet").unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
	chats: many(chats),
}));

export const lastCheckedBlocks = pgTable("last_checked_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: lastCheckedBlockType(),
  blockNumber: text("block_number").notNull(),
});

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
})

export const chatsRelations = relations(chats, ({ one, many }) => ({
	user: one(users, {
    fields: [chats.userId], 
    references: [users.id],
  }),
  messages: many(messages)
}));

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content"),
  role: messageRoles(),
  chatId: uuid('chat_id').notNull().references(() => chats.id),
  createdAt: timestamp().defaultNow().notNull()
})

export const messagesRelations = relations(messages, ({one}) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  })
}))
export const createdTokens = pgTable("created_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockTimestamp: text("block_timestamp").notNull(),
  initialAmount: text("initial_amount").notNull(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  owner: text("owner").notNull(),
  token_address: text("token").notNull(),
});
