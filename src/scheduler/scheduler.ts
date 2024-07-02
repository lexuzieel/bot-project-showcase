import cronstrue from "cronstrue";
import cron from "node-cron";
import { ulid } from "ulid";
import logger from "../utils/logger";

export class Scheduler {
    private tasks: Map<string, cron.ScheduledTask> = new Map();
    private defaultOptions: cron.ScheduleOptions = {
        timezone: "UTC",
    };
    private logger = logger.child({ module: "scheduler" });

    public schedule(
        schedule: string,
        handler: (now: Date | "manual" | "init") => void,
        name?: string,
    ) {
        const id = ulid();

        const logger = this.logger.child({ name, task: id });

        this.tasks.set(
            id,
            cron.schedule(
                schedule,
                now => {
                    logger.debug(`Running scheduled task`);

                    try {
                        handler(now);
                    } catch (error) {
                        if (error instanceof Error) {
                            logger.error(`Got error while running task`, {
                                error,
                            });
                        }

                        throw error;
                    }
                },
                {
                    name: id,
                    ...this.defaultOptions,
                },
            ),
        );

        let humanReadableSchedule = cronstrue.toString(schedule, {
            use24HourTimeFormat: true,
        });

        humanReadableSchedule =
            humanReadableSchedule.substring(0, 1).toLowerCase() +
            humanReadableSchedule.substring(1);

        logger.debug(`Scheduled task to run ${humanReadableSchedule}`);
    }

    public start() {
        this.logger.debug("Starting scheduler");

        for (const task of Object.values(this.tasks)) {
            task.start();
        }

        this.logger.debug(`Started ${this.tasks.size} tasks`);
    }

    public stop() {
        this.logger.debug("Stopping tasks...");

        for (const task of Object.values(this.tasks)) {
            task.stop();
        }

        this.logger.debug(`Stopped ${this.tasks.size} tasks`);
    }
}

export const scheduler = new Scheduler();
