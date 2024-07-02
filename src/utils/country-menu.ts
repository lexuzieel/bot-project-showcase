import { CustomContext } from "../bot/context";
import { SubscriptionType } from "../db/entity/invoice.ts.bak";

export const countryMenuText = (ctx: CustomContext) => {
    switch (ctx.session.subscriptionType) {
        case SubscriptionType.APPOINTMENT: {
            return ctx.t("appointment-country-menu");
        }
        case SubscriptionType.NOTIFICATION: {
            return ctx.t("notification-country-menu");
        }
        case SubscriptionType.WIDGET: {
            return ctx.t("widget-country-menu");
        }
    }

    return "country-menu";
};
