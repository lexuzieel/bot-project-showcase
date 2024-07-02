import { I18n } from "@grammyjs/i18n";
import { Bot } from "grammy";
import { locales } from "../../utils/localization";
import { CustomContext } from "../context";

export const defaultLocale = locales[0];

export const i18n = new I18n<CustomContext>({
    defaultLocale,
    directory: "locales",
});

export const setupLocales = (bot: Bot<CustomContext>) => {
    bot.use(i18n);
};
