import { Payment } from "@a2seven/yoo-checkout";
import dotenv from "dotenv";
import express, { Application } from "express";
import { InlineKeyboard } from "grammy";
import { bot } from "../bot/bot";
import { clearInlineKeyboardForUser } from "../bot/conversations/utils/clear-keyboard";
import { Invoice } from "../db/entity/invoice.ts.bak";
import { CALLBACK_QUERY } from "../defines";
import { appendMetadata, forEachAdmin } from "../utils/admins";
import { t } from "../utils/localization";
import baseLogger from "../utils/logger";
import { yooKassa } from "../yookassa/yookassa";

dotenv.config();

let logger = baseLogger.child({ module: "web", scope: "yookassa" });

export const yookassa = (app: Application) => {
    app.use(express.json()).post("/yookassa/notify", async (req, res) => {
        /**
         * REDACTED
         */

        res.sendStatus(200);
    });

    logger.debug("YooKassa middleware installed");
};
