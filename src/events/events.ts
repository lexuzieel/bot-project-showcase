import EventEmitter from "events";

class EventBus extends EventEmitter {
    constructor() {
        super();
    }
}

export const events = new EventBus();
