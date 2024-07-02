import { Bot } from "grammy";
import { CustomContext, setupContext } from "../context";
import { installConversations } from "../conversations/conversations";
import { setupAutoretry } from "./auto-retry";
import { setupConversations } from "./conversations";
import { setupLocales } from "./i18n";
import { setupMenu } from "./menu";
import { setupSequentialize } from "./sequentialize";
import { clearSession, setupSession } from "./session";

export const setupMiddleware = (bot: Bot<CustomContext>) => {
    bot.command("start", async (ctx, next) => {
        await clearSession(ctx);
        await next();
    });

    setupAutoretry(bot);
    setupSequentialize(bot);
    setupLocales(bot);
    setupSession(bot);
    setupContext(bot);
    setupConversations(bot);
    installConversations(bot);
    setupMenu(bot);
};
