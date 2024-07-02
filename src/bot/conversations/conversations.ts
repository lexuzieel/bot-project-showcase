import { createConversation } from "@grammyjs/conversations";
import { Bot } from "grammy";
import { CustomContext } from "../context";
import { addAppointmentSubscription } from "./add-appointment-subscription";
import { addNotificationSubscription } from "./add-notification-subscription";
import { dateRange } from "./date-range";
import { orderWidgetSubscription } from "./order-widget-subscription";
import { otherCountryRequest } from "./other-country";
import { promoCode } from "./promo-code";
import { ais, cgi } from "./subscription";

export const installConversations = (bot: Bot<CustomContext>) => {
    bot.use(
        createConversation(cgi, {
            id: "subscription-cgi",
        }),
    );
    bot.use(
        createConversation(ais, {
            id: "subscription-ais",
        }),
    );
    bot.use(
        createConversation(dateRange, {
            id: "date-range",
        }),
    );
    bot.use(
        createConversation(promoCode, {
            id: "promo-code",
        }),
    );
    bot.use(
        createConversation(otherCountryRequest, {
            id: "other-country-request",
        }),
    );
    bot.use(
        createConversation(orderWidgetSubscription, {
            id: "order-widget-subscription",
        }),
    );
    bot.use(
        createConversation(addNotificationSubscription, {
            id: "add-notification-subscription",
        }),
    );
    bot.use(
        createConversation(addAppointmentSubscription, {
            id: "add-appointment-subscription",
        }),
    );
};
