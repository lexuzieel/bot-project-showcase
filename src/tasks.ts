import { scheduleAisMonitoringTask } from "./scheduler/tasks/ais-monitoring";
import { scheduleAppointmentDateCompression } from "./scheduler/tasks/appointment-date-compression";

export const scheduleTasks = async () => {
    await scheduleAisMonitoringTask();
    await scheduleAppointmentDateCompression();
};
