import { invoiceCommandHandler } from "./commands/invoice";
import { generateLead } from "./commands/start";
import { userCommandHandler } from "./commands/user";
import { CustomContext } from "./context";
import { checkAdmin } from "./middleware/check-admin";
import { showMenu } from "./middleware/menu";
import { sendPromo } from "./middleware/menu/widget-promo";

export const setupCommands = async (bot: Bot<CustomContext>) => {
    bot.command("start", async ctx => {
        const campaign = await generateLead(ctx);

        switch (campaign?.source) {
            case "widget": {
                await sendPromo(ctx);

                break;
            }
            default: {
                await showMenu(ctx);
            }
        }
    });

    bot.command("menu", async ctx => {
        await showMenu(ctx);
    });

    bot.command("id", async ctx => {
        await ctx.reply(ctx.t("user.id", { id: ctx.user.id }), {
            parse_mode: "HTML",
        });
    });

    bot.command("invoice", checkAdmin, invoiceCommandHandler);
    bot.command("user", checkAdmin, userCommandHandler);
};
