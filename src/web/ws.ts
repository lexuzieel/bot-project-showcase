import { Application } from "express";
import { Server } from "socket.io";
import baseLogger from "../utils/logger";
import { users } from "./ws/users";

const logger = baseLogger.child({ module: "web", scope: "ws" });

export const ws = (app: Application, io: Server) => {
    users(io);

    logger.debug("WebSocket middleware installed");
};
