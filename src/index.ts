import dotenv from "dotenv";
import { Settings } from "luxon";
import "reflect-metadata";
import { bot } from "./bot/bot";
import { initializeDatabase } from "./db/db";
import { worker } from "./queue/worker";
import { scheduler } from "./scheduler/scheduler";
import { scheduleTasks } from "./tasks";
import { initializeTimeseries } from "./timeseries/timeseries";
import { waitForSignal } from "./utils";
import { initializeLocalization } from "./utils/localization";
import logger from "./utils/logger";
import { mailsac } from "./web/mailsac";
import { server } from "./web/server";
import { widget } from "./web/widget";
import { ws } from "./web/ws";
import { yookassa } from "./web/yookassa";

dotenv.config();

Settings.defaultZone = "UTC";

async function main() {
    logger.info("Starting the application...");

    await initializeLocalization();

    await initializeDatabase();
    await initializeTimeseries();

    await bot.start();

    worker.start();
    scheduler.start();

    await scheduleTasks();

    server.install(yookassa);
    server.install(widget);
    server.install(ws);
    server.start();

    logger.info("Application has started");
}

main();

waitForSignal(async () => {
    const taskTimeout = 300000;

    scheduler.stop();
    logger.info(`Waiting up to ${taskTimeout}ms for tasks to finish...`);
    await worker.stop({ timeout: taskTimeout });
    await bot.stop();
});
