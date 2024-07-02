import EventEmitter from "events";
import fastq, { queueAsPromised } from "fastq";
import { kebabCase } from "lodash";
import logger from "../utils/logger";
import { Task } from "./task";

export type QueueOptions = {
    name?: string;
    /**
     * Number of concurrent tasks being processed.
     */
    concurrency?: number;
    /**
     * Timeout in milliseconds. 60 seconds by default.
     */
    timeout?: number;
};

export class Queue<T extends Task> {
    protected timeout;
    protected q: queueAsPromised<T>;
    protected emitter: EventEmitter = new EventEmitter();

    private logger = logger.child({ module: "queue" });

    constructor(options?: QueueOptions) {
        if (options?.name) {
            this.logger = this.logger.child({ name: kebabCase(options.name) });
        }

        this.q = fastq.promise(this, this.handle, options?.concurrency || 1);
        this.timeout = options?.timeout || 60000;
    }

    /**
     * @param event Only "error" for now
     * @param listener
     */
    public on(event: string, listener: (...args: unknown[]) => void) {
        this.emitter.on(event, listener);
    }

    public off(event: string, listener: (...args: unknown[]) => void) {
        this.emitter.off(event, listener);
    }

    /**
     * Start processing tasks on the queue.
     */
    public start() {
        this.q.resume();
    }

    /**
     * Pause processing tasks on the queue.
     */
    public pause() {
        this.q.pause();
    }

    /**
     *
     * Push a task to the queue.
     *
     * Run with `await` to wait for the enqueued task to complete, otherwise
     * run without `await` to just enqueue it and continue.
     *
     * @param task The task to push
     */
    public async push(task: T): Promise<void> {
        this.logger.debug(`Added new task to the queue`, {
            task: task.id,
        });

        await this.q.push(task).catch(err => this.emitter.emit("error", err));
    }

    private stopped = false;

    /**
     * Mark the queue as stopped so it won't process
     * any new or pending tasks after this.
     */
    public stop() {
        this.stopped = true;
    }

    /**
     * Wait for the queue to finish processing all tasks.
     */
    public async wait(): Promise<void> {
        await this.q.drained();
    }

    /**
     * Handle a task.
     *
     * @param task The task to process
     */
    protected async handle(task: T): Promise<void> {
        const logger = this.logger.child({ task: task.id });

        if (this.stopped) {
            logger.debug(`Queue has been stopped - skipping task`);
            return;
        }

        logger.debug(`Processing task`);

        let timeout: NodeJS.Timeout;

        await Promise.race([
            task.handle(),
            new Promise<void>((resolve, reject) => {
                if (this.timeout > 0) {
                    timeout = setTimeout(async () => {
                        logger.debug(`Time out reached - killing task...`);

                        const err = new Error(
                            `Task timed out after ${this.timeout} ms`,
                        );

                        await task.error(err);

                        logger.debug(`Task has been killed`);

                        reject(err);
                    }, this.timeout);
                }
            }),
        ])
            .then(() => {
                logger.debug(`Task finished`);
            })
            .catch(async (error: Error) => {
                logger.error(`Got error while processing task`, {
                    error: error,
                });

                this.emitter.emit("error", error);

                await task.error(error);
            })
            .finally(async () => {
                clearTimeout(timeout);
            });
    }
}
