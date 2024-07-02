import dotenv from "dotenv";
import logger from "./utils/logger";

dotenv.config();

let attemptedToExit = false;

export const waitForSignal = (shutdown?: () => Promise<void>) => {
    const exit = async () => {
        if (attemptedToExit) {
            logger.warn(`Received another exit signal - forcing exit`);
            process.exit(0);
        } else {
            logger.info(
                `Received exit signal - attempting to shutdown gracefully...`,
            );
        }

        attemptedToExit = true;

        if (shutdown) {
            logger.debug("Running shutdown function");
            await shutdown();
            logger.debug("Shutdown function finished");
        }

        process.exit(0);
    };

    process.on("SIGINT", exit);
    process.on("SIGTERM", exit);

    process.stdin.resume();
};

export const applicationName = () => {
    return process.env.APP_NAME || "app";
};

export const getEnvironment = () => {
    return process.env.NODE_ENV || "local";
};
