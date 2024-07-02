import { DateTime } from "luxon";

export const today = () =>
    DateTime.now().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    });
