import { Bot } from "grammy";
import { updatePreviousMessage } from "../../utils/previous-message";
import { start } from "../commands/start";
import { CustomContext } from "../context";
import { backToMain } from "./menu/back-to-main";
import { cities } from "./menu/cities";
import { countries } from "./menu/countries";
import { info } from "./menu/info";
import { invoiceCreated } from "./menu/invoice/created";
import { invoices } from "./menu/invoices";
import { main } from "./menu/main";
import { services } from "./menu/services";
import { widgetPromo } from "./menu/widget-promo";

export const setupMenu = (bot: Bot<CustomContext>) => {
    main.register([
        invoices,
        services,
        countries,
        cities,
        info,
        invoiceCreated,
        backToMain,
        widgetPromo,
    ]);
    bot.use(main);
};

export const showMenu = async (ctx: CustomContext) => {
    const msg = await ctx.reply(start.text(ctx), start.other);

    await new Promise(resolve => setTimeout(resolve, 100));

    await updatePreviousMessage(ctx, msg);
};

export const closeMenu = async (ctx: CustomContext) => {
    try {
        await ctx.deleteMessage();
    } finally {
        // await ctx.menu.close({ immediate: true });
    }
};
