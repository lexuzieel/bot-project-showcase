import { Menu } from "@grammyjs/menu";
import { start } from "../../commands/start";
import { CustomContext } from "../../context";
import { history } from "./utils/history";

export const info = new Menu<CustomContext>("info").text(
    ctx => ctx.t("nav.back"),
    async (ctx, next) => {
        const menu = history.peek(ctx);

        if (menu && menu != "main") {
            await ctx.editMessageText(ctx.t(menu), {
                parse_mode: "HTML",
            });
        } else {
            await ctx.editMessageText(start.text(ctx), start.other);
        }

        next();
    },
    history.back,
);
