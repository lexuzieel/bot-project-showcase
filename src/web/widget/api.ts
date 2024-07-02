import express from "express";
import logger from "../../utils/logger";
import { auth } from "./auth";

const log = logger.child({ module: "web", name: "widget-api" });

export const api = express.Router();

api.use("/auth", auth);

api.get("/dates", async (req, res, next) => {
    /**
     * REDACTED
     */
});

api.get("/locations", async (req, res, next) => {
    /**
     * REDACTED
     */
});
