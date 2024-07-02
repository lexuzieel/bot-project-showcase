import { NextFunction } from "grammy";
import logger from "../../utils/logger";
import { CustomContext } from "../context";
import { showMenu } from "./menu";

export const checkActiveUser = async (
    ctx: CustomContext,
    next: NextFunction,
) => {
    if (ctx.user.active) {
        await next();
    } else {
        await ctx.reply(ctx.t("waitlist.no-access"), {
            parse_mode: "HTML",
        });

        await showMenu(ctx);

        logger
            .child({ module: "check-active-user" })
            .debug(`User ${ctx.user.telegramId} is not active`);
    }
};
