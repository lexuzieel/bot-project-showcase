import cors from "cors";
import dotenv from "dotenv";
import { Application } from "express";
import baseLogger from "../utils/logger";
import { api } from "./widget/api";
import { session } from "./widget/session";

dotenv.config();

const logger = baseLogger.child({ module: "web", scope: "widget" });

export const widget = (app: Application) => {
    const origin = process.env.API_CORS_ORIGIN || "*";
    const credentials = process.env.API_ALLOW_CREDENTIALS == "true";

    app.use(
        cors({
            origin,
            credentials,
        }),
    )
        .use(session)
        .use("/widget", api);

    logger.debug("Widget API middleware installed");
};
