import dotenv from "dotenv";
import express, { Application } from "express";
import { events } from "../events/events";
import baseLogger from "../utils/logger";

dotenv.config();

const logger = baseLogger.child({ module: "web", scope: "mailsac" });

export const MAILSAC_EVENT_INCOMING_MAIL = "mailsac:incoming-mail";

export type MailsacEventIncomingMailPayload = {
    from: string;
    to: string;
    text: string;
};

export const mailsac = (app: Application) => {
    app.use(express.json()).post("/mailsac/webhook", async (req, res) => {
        /**
         * REDACTED
         */

        res.sendStatus(200);
    });

    logger.debug("Mailsac middleware installed");
};
