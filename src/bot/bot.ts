import { parseMode } from "@grammyjs/parse-mode";
import { RunnerHandle, run } from "@grammyjs/runner";
import dotenv from "dotenv";
import { Bot as GrammyBot } from "grammy";
import { CALLBACK_QUERY } from "../defines";
import logger from "../utils/logger";
import { setupCommands } from "./commands";
import { CustomContext } from "./context";
import { showMenu } from "./middleware/menu";
import { setupMiddleware } from "./middleware/middleware";
import { clearSession } from "./middleware/session";

dotenv.config();

export type BotOptions = {
    token?: string;
};

class Bot {
    private logger = logger.child({ module: "bot" });
    private bot: GrammyBot<CustomContext>;
    private runner?: RunnerHandle;

    constructor(options?: BotOptions) {
        const token = options?.token || process.env.TELEGRAM_TOKEN || "";
        const bot = new GrammyBot<CustomContext>(token);

        setupMiddleware(bot);
        setupCommands(bot);

        bot.on("message:text", async ctx => {
            await showMenu(ctx);
        });

        bot.callbackQuery(
            [CALLBACK_QUERY.START, CALLBACK_QUERY.RESTART],
            async ctx => {
                try {
                    await ctx.editMessageReplyMarkup();
                } finally {
                    await showMenu(ctx);
                }
            },
        );

        bot.catch(async err => {
            this.logger.error("Got unhandled bot error", { error: err });
            await clearSession(err.ctx);
        });

        bot.api.config.use(parseMode("HTML"));

        this.bot = bot;
    }

    public async start() {
        this.logger.debug("Starting bot");

        if (this.runner && this.runner.isRunning()) {
            throw new Error("Bot is already running");
        }

        this.runner = run(this.bot);
    }

    public async stop() {
        this.logger.debug("Stopping bot");

        if (!this.runner || !this.runner.isRunning()) {
            throw new Error("Bot is not running");
        }

        await this.runner.stop();
    }

    public get api() {
        return this.bot.api;
    }
}

export const bot = new Bot();
