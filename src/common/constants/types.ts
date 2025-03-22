import { InferModel } from "drizzle-orm";
import { chats, createdTokens, messages, users } from "src/apps/api/modules/drizzle/schema";

export type TUser = InferModel<typeof users, 'select'>;

export type TChats = InferModel<typeof chats, 'select'>;

export type TMessage = InferModel<typeof messages, 'select'>;

export type TCreatedTokens = InferModel<typeof createdTokens, 'select'>;