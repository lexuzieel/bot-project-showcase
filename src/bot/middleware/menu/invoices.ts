import { Menu } from "@grammyjs/menu";
import _ from "lodash";
import { icons } from "../../../utils/icons";
import logger from "../../../utils/logger";
import { start } from "../../commands/start";
import { CustomContext } from "../../context";
import { showMenu } from "../menu";
import { clearSession } from "../session";
import { invoiceSettings } from "./invoice/settings";
import { invoiceView } from "./invoice/view";
import { history } from "./utils/history";
import { paginate } from "./utils/paginate";

export const invoices = new Menu<CustomContext>("invoices", {
    onMenuOutdated: "", // Don't display outdated menu message.
})
    .dynamic(async (ctx, range) => {
        const numInvoices = ctx.user.invoices?.length || 0;

        if (numInvoices == 0) {
            range.text(ctx.t("invoices.no-invoices"));
        }
    })
    .row()
    .dynamic(
        paginate(
            "invoices",
            async ctx => _.orderBy(ctx.user.invoices, "createdAt", "desc"),
            async (item, range, payload) => {
                range
                    .text(
                        {
                            text: ctx => {
                                let icon = "";
                                // item.status == "pending"
                                //     ? icons.WAITING
                                //     : "";

                                if (item.expired) {
                                    icon = icons.EXPIRED;
                                } else if (item.done) {
                                    icon = icons.DONE;
                                } else if (item.status == "pending") {
                                    icon = icons.PENDING;
                                } else if (item.status == "declined") {
                                    icon = icons.CANCEL;
                                } else if (item.paused) {
                                    icon = icons.SLEEP;
                                }

                                return (
                                    ctx.t(`invoices.list-item`, {
                                        icon,
                                        id: item.id,
                                        date: item.createdAt,
                                        name: item.title(ctx),
                                    }) + (icon.length > 0 ? ` ${icon}` : "")
                                );
                            },
                            payload,
                        },
                        history.add("invoices"),
                        async (ctx, next) => {
                            ctx.session.invoiceId = item.id;
                            await next();
                        },
                        async (ctx, next) => {
                            try {
                                await ctx.editMessageText(
                                    await item.invoiceDetails(ctx),
                                    {
                                        parse_mode: "HTML",
                                        reply_markup: invoiceView,
                                    },
                                );
                            } catch (e) {
                                logger.error(
                                    `Unable to show invoice ${item.id}`,
                                    {
                                        invoice: item.id,
                                        error: e,
                                    },
                                );
                                await showMenu(ctx);
                            }

                            await next();
                        },
                    )
                    .row();
            },
        ),
    )
    .row()
    .text(
        {
            text: ctx => ctx.t("nav.back"),
            payload: ctx => ctx.session.pagination?.payload || "",
        },
        history.back,
        async ctx => {
            try {
                ctx.editMessageText(start.text(ctx), start.other);
            } catch (e) {
                console.log(e);
                await clearSession(ctx);
                await showMenu(ctx);
            }
        },
    );

invoices.register([invoiceView, invoiceSettings]);
