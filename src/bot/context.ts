import { ConversationFlavor } from "@grammyjs/conversations";
import { I18nFlavor } from "@grammyjs/i18n";
import { Bot, Context, NextFunction, SessionFlavor } from "grammy";
import { User } from "../db/entity/user";
import { Location } from "../location/location";
import { SessionData } from "./middleware/session";

export type CustomContext = Context & {
    user: User;
    location?: Location;
} & SessionFlavor<SessionData> &
    ConversationFlavor &
    I18nFlavor;

export const hydrateContext = async (
    ctx: CustomContext,
    next: NextFunction,
) => {
    if (ctx.from) {
        let user = await User.findOne({
            where: { telegramId: ctx.from.id },
            relations: {
                appointmentSubscriptions: true,
                notificationSubscriptions: true,
                widgetSubscriptions: true,
            },
        });

        if (!user) {
            user = new User();
            user.telegramId = ctx.from.id;
        }

        // Update user data on each update
        user.firstName = ctx.from.first_name;
        user.lastName = ctx.from.last_name || "";
        user.username = ctx.from.username || "";

        await user.save();

        ctx.user = user;
    }

    if (ctx.session.city) {
        ctx.location = Location.byCity(ctx.session.city);
    }

    await next();
};

export const setupContext = (bot: Bot<CustomContext>) => {
    bot.use(hydrateContext);
};
