import { NextFunction } from "grammy";
import { admins } from "../../utils/admins";
import logger from "../../utils/logger";
import { CustomContext } from "../context";

export const checkAdmin = async (ctx: CustomContext, next: NextFunction) => {
    if (admins.includes(ctx.user.telegramId)) {
        await next();
    } else {
        logger
            .child({ module: "check-admin" })
            .debug(
                `User ${ctx.user.telegramId} is not admin: ${ctx.msg?.text}`,
            );
    }
};
