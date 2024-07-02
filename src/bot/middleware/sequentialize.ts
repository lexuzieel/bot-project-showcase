import { sequentialize } from "@grammyjs/runner";
import { Bot } from "grammy";
import { CustomContext } from "../context";

export const setupSequentialize = (bot: Bot<CustomContext>) => {
    const constraints = (ctx: CustomContext) => String(ctx.chat?.id);
    bot.use(sequentialize(constraints));
};
