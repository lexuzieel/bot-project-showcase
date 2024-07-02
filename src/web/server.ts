import dotenv from "dotenv";
import express, { Application } from "express";
import { createServer } from "http";
import { Server as IO } from "socket.io";
import baseLogger from "../utils/logger";

dotenv.config();

const logger = baseLogger.child({ module: "web", scope: "default" });

class Server {
    private app: express.Express;
    private port: number;
    private server;
    private _io;

    constructor(port?: number) {
        const app = express();
        this.port = parseInt(process.env.WEB_PORT || "") || port || 80;

        this.server = createServer(app);
        this._io = new IO(this.server, {
            cors: {
                origin: process.env.API_CORS_ORIGIN || "*",
            },
        });

        app.get("/ping", (req, res) => {
            res.send("pong");
        });

        this.app = app;
    }

    public start() {
        this.server.listen(this.port, () => {
            logger.debug(`Web server listening on port ${this.port}`);
        });
    }

    public install(decorator: (app: Application, io: IO) => void) {
        decorator(this.app, this._io);
    }

    public get io() {
        if (!this._io) {
            throw new Error("Server has not been started");
        }

        return this._io;
    }
}

export const server = new Server();
