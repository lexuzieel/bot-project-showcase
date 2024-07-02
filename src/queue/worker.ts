import baseLogger from "../utils/logger";
import { Queue } from "./queue";
import { Task } from "./task";

const logger = baseLogger.child({ module: "worker" });

const defaultTimeout = 60000;

export type WorkerStopOptions = {
    /**
     * Timeout in milliseconds. 60 seconds by default.
     */
    timeout?: number;
};

export class Worker {
    private queues: Map<string, Queue<Task>> = new Map();

    public add(name: string, queue: Queue<Task>) {
        this.queues.set(name, queue);
    }

    public remove(name: string) {
        this.queues.delete(name);
    }

    public get(name: string) {
        return this.queues.get(name);
    }

    public start() {
        this.queues.forEach(queue => queue.start());
    }

    public pause() {
        this.queues.forEach(queue => queue.pause());
    }

    public async stop(options?: WorkerStopOptions) {
        const shutdownTimeout = options?.timeout || defaultTimeout;

        logger.debug(
            `Waiting up to ${shutdownTimeout}ms for queues to finish processing tasks`,
        );

        this.queues.forEach(queue => queue.stop());

        let t;

        const timeout = new Promise<void>(resolve => {
            t = setTimeout(() => {
                logger.warn(
                    "Timeout reached while waiting for queues to finish",
                );

                resolve();
            }, shutdownTimeout);
        });

        const handlers = [
            ...Array.from(this.queues.values()).map(queue => queue.wait()),
        ];

        // Wait for all tasks to finish gracefully up to the timeout.
        await Promise.race([timeout, Promise.all(handlers)]);

        clearTimeout(t);
    }
}

export const worker = new Worker();
