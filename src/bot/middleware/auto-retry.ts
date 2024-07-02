import { autoRetry } from "@grammyjs/auto-retry";
import { Bot } from "grammy";
import { CustomContext } from "../context";

export const setupAutoretry = (bot: Bot<CustomContext>) => {
    bot.api.config.use(autoRetry());
};
