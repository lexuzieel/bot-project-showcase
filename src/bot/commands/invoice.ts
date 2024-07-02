import { CommandContext } from "grammy";
import { Nullable } from "../../utils/nullable";
import { CustomContext } from "../context";
import { backToMain } from "../middleware/menu/back-to-main";
import { parseCommand } from "./utils/parse-command";

export const invoiceCommandHandler = async (
    ctx: CommandContext<CustomContext>,
) => {
    const args = parseCommand(ctx);

    let invoice: Nullable<Invoice> = null;

    if (args.id) {
        invoice = await Invoice.findOne({
            where: { id: args.id },
            relations: {
                user: {
                    appointmentSubscriptions: true,
                    notificationSubscriptions: true,
                    widgetSubscriptions: true,
                },
            },
        });

        if (!invoice) {
            return await ctx.reply(ctx.t("errors.invoice-not-found"));
        }
    }

    switch (args.action) {
        case "show": {
            if (invoice) {
                await ctx.reply(await invoice.invoiceText(ctx), {
                    parse_mode: "HTML",
                });
            } else {
                await ctx.reply(ctx.t("errors.invoice-not-found"));
            }

            break;
        }
        case "delete": {
            if (invoice) {
                if (invoice.status == "declined") {
                    if (invoice.subscription) {
                        await invoice.subscription.remove();
                        await invoice.remove();
                        await ctx.reply(
                            ctx.t("invoice.deleted", {
                                id: invoice.id,
                            }),
                            {
                                parse_mode: "HTML",
                            },
                        );
                    } else {
                        await ctx.reply(
                            ctx.t("errors.invoice-no-subscription"),
                        );
                    }
                } else {
                    await ctx.reply(
                        ctx.t("errors.invoice-missing-subscription"),
                    );
                }
            } else {
                await ctx.reply(ctx.t("errors.invoice-not-found"));
            }

            break;
        }
        case "accept":
        case "decline": {
            if (invoice) {
                const status =
                    args.action == "accept" ? "accepted" : "declined";

                const accepted = status == "accepted";

                if (invoice.subscription) {
                    if (accepted) {
                        await invoice.accept();
                    } else {
                        await invoice.decline();
                    }
                } else {
                    await ctx.reply(
                        ctx.t("errors.invoice-missing-subscription"),
                    );
                }

                await ctx.reply(
                    ctx.t(`invoice.${invoice.status}`, {
                        id: invoice.id,
                    }),
                    {
                        parse_mode: "HTML",
                    },
                );

                await ctx.reply(await invoice.invoiceText(ctx), {
                    parse_mode: "HTML",
                    reply_markup: backToMain,
                });

                const recipient = invoice.user.telegramId;
                if (accepted && recipient != ctx.user.telegramId) {
                    await ctx.api.sendMessage(
                        recipient,
                        await invoice.invoiceText(ctx),
                        {
                            parse_mode: "HTML",
                            reply_markup: backToMain,
                        },
                    );
                }
            }

            break;
        }
    }
};
