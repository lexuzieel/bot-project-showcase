import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { Session } from "../../../db/entity/session";
import { User } from "../../../db/entity/user";
import { writeSessionCookie } from "../session";

dotenv.config();

export const telegram = express.Router();

/**
 * Telegram authentication payload
 */
type TelegramAuthentication = {
    [key: string]: string | number | undefined;

    auth_date: number;
    first_name: string;
    last_name?: string;
    hash: string;
    id: number;
    photo_url: string;
    username?: string;
};

telegram.post("/login", async (req, res) => {
    const data: TelegramAuthentication = req.body;

    if (!checkSignature(data)) {
        return res.sendStatus(401);
    }

    // We have successfully passed signature check, so
    // now we must find or create the user.

    const user = await findOrCreateUser(data);

    // If user is not the same as the one stored in
    // the session we need to create a new session.

    if (!req.user || req.user?.id != user.id) {
        const session = new Session();
        session.user = user;
        await session.save();
        await writeSessionCookie(session, req, res);
    }

    res.sendStatus(200);
});
