import { Conversation, conversations } from "@grammyjs/conversations";
import { Bot } from "grammy";
import { CustomContext } from "../context";

export type CustomConversation = Conversation<CustomContext>;

export const setupConversations = (bot: Bot<CustomContext>) => {
    bot.use(conversations<CustomContext>());
};
