import config from "../../config";
import logger from "../../utils/logger";
import { scheduler } from "../scheduler";

const schedule = config.api?.compression?.schedule || "* * * * *";

const log = logger.child({
    module: "scheduler",
    task: "compress-appointment-dates",
});

export const scheduleAppointmentDateCompression = async () => {
    if (config.api?.compression?.enabled == false) {
        log.debug("Appointment date compression is disabled");
        return;
    }

    scheduler.schedule(schedule, run, "appointment-date-compression");
};

const run = async () => {
    /**
     * REDACTED
     */
};
