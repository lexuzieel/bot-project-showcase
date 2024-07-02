import { describe, expect, test } from "vitest";
import { Queue } from "./queue";
import { Task } from "./task";
import { worker } from "./worker";

class TestTask extends Task {
    constructor(private handler?: () => void) {
        super();
    }

    async handle() {
        await new Promise(resolve =>
            setTimeout(() => {
                this.handler?.();
                resolve(undefined);
            }, 1000),
        );
    }
}

describe("worker", () => {
    test("queued tasks are not processed after worker is stopped", async () => {
        let processed = 0;
        const queue = new Queue<TestTask>();

        worker.add("test-queue", queue);

        for (let i = 1; i <= 3; i++) {
            queue.push(new TestTask(() => processed++));
        }

        worker.start();

        await worker.stop({ timeout: 1500 });

        expect(processed).toBe(1);
    });
});
