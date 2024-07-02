import { Menu } from "@grammyjs/menu";
import config from "../../../config";
import { getPricesText } from "../../../utils/prices";
import { commands } from "../../commands";
import { CustomContext } from "../../context";
import { history } from "./utils/history";
import { sendPromo } from "./widget-promo";

export const main = new Menu<CustomContext>("main")
    .dynamic(async (ctx, range) => {
        const numInvoices = ctx.user.invoices?.length || 0;

        if (numInvoices > 0) {
            range.submenu(
                ctx => ctx.t("nav.invoices") + ` (${numInvoices})`,
                "invoices",
                history.delete,
                ctx =>
                    ctx.editMessageText(ctx.t("invoices"), {
                        parse_mode: "HTML",
                    }),
            );
        }
    })
    .row()
    .submenu(
        ctx => ctx.t("nav.services"),
        "services",
        history.delete,
        ctx => ctx.editMessageText(ctx.t("services")),
    )
    .dynamic(async (ctx, range) => {
        for (const command of commands) {
            if (["invoices", "new", "terms", "support"].includes(command)) {
                continue;
            }

            let text = "";

            switch (command) {
                case "prices": {
                    text = await getPricesText(ctx);
                    break;
                }
                default: {
                    text = ctx.t(command);
                }
            }

            range.row().submenu(
                ctx => ctx.t(`nav.${command}`),
                "info",
                ctx =>
                    ctx.editMessageText(text, {
                        parse_mode: "HTML",
                    }),
                history.add("main"),
            );
        }
    })
    .dynamic((ctx, range) => {
        range.row().url(ctx.t("nav.support"), ctx.t("support-url"));
    });
