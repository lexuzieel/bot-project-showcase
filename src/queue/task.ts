import EventEmitter from "events";
import { kebabCase } from "lodash";
import { ulid } from "ulid";
import logger from "../utils/logger";

export abstract class Task extends EventEmitter {
    protected _id: string = ulid();
    protected ts: Date = new Date();
    protected logger = logger.child({
        module: "task",
        name: kebabCase(this.constructor.name.replace(/Task$/, "")),
        id: this.id,
    });

    public get id(): string {
        return this._id;
    }

    public get timestamp(): Date {
        return this.ts;
    }

    public abstract handle(): Promise<void>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async error(err: Error): Promise<void> {
        // NOOP
    }
}
