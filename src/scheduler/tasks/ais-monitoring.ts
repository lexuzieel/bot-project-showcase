import config from "../../config";
import logger from "../../utils/logger";
import { scheduler } from "../scheduler";

const log = logger.child({
    module: "scheduler",
    task: "ais-monitoring",
});

// prettier-ignore
const concurrency = parseInt(
    process.env.AIS_MONITORING_CONCURRENCY ||
    config.monitoring?.ais?.concurrency?.toString() ||
    "1",
);

if (concurrency <= 0) {
    log.warn("Concurrency is set to zero, no tasks will be processed");
}

// // prettier-ignore
// const timeoutMinutes = parseInt(
//     process.env.AIS_MONITORING_TIMEOUT ||
//     config.monitoring?.timeoutMinutes?.toString() ||
//     "5",
// );

// // Create ais monitoring queue
// const aisMonitoringQueue = new Queue<Ais>({
//     name: "ais-monitoring",
//     concurrency,
//     timeout: timeoutMinutes * 60000,
// });

// // Add created queue to worker
// worker.add("ais-monitoring", aisMonitoringQueue);

// aisMonitoringQueue.on("error", err => {
//     logger.error("Got ais monitoring queue error", { error: err });
// });

// let monitoringAccountSettings: CyclicList<MonitoringAccountSettings>;

// events.on(
//     AIS_APPOINTMENT_SPAWN_EVENT,
//     async (input: AisScraperInput, subscription: AppointmentSubscription) => {
//         aisMonitoringQueue.push(
//             new Ais(ScraperMode.SCHEDULE, input, subscription),
//         );
//     },
// );

const enqueueTasks = async () => {
    /**
     * REDACTED
     */
};

const schedule = config.monitoring?.ais?.schedule || "*/10 * * * *";

export const scheduleAisMonitoringTask = async () => {
    if (!config.monitoring?.ais?.enabled) {
        log.debug("AIS monitoring is disabled");
        return;
    }

    // monitoringAccountSettings = new CyclicList(
    //     (await getMonitoringAccountSettings()).filter(
    //         account => account.provider == "ais",
    //     ),
    // );

    scheduler.schedule(schedule, enqueueTasks, "ais-monitoring");
};
