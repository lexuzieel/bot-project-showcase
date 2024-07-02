import { FileAdapter } from "@grammyjs/storage-file";
import { Bot, session } from "grammy";
import { SubscriptionType } from "../../db/entity/invoice.ts.bak";
import logger from "../../utils/logger";
import { CustomContext } from "../context";
import { NavigationHistorySessionFlavor } from "./menu/utils/history";
import { PaginationSessionFlavor } from "./menu/utils/paginate";

export type SessionData = {
    subscriptionType?: SubscriptionType;
    country?: string;
    city?: string;
    invoiceId?: string;
    subscriptionId?: string;
    lastMessageId?: number;
    lastState?: string;
} & NavigationHistorySessionFlavor &
    PaginationSessionFlavor;

const initial = (): SessionData => {
    return {
        //
    };
};

const storage = new FileAdapter<SessionData>({
    dirName: "storage/sessions",
});

export const setupSession = (bot: Bot<CustomContext>) => {
    bot.use(
        session({
            initial,
            storage,
        }),
    );
};

export const clearSession = async (ctx: CustomContext) => {
    const id = ctx.from?.id.toString() || "";

    try {
        await storage.delete(id);
    } catch (e) {
        //
    }

    logger.debug(`Cleared session for user id ${id}`, { user: id });
};
