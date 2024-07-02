import "reflect-metadata";
import { DataSource } from "typeorm";
import { defaultDataSourceOptions } from "../db/db";
import logger from "../utils/logger";
import { AppointmentDate } from "./entity/appointment-date";
import { CompressedAppointmentDate } from "./entity/compressed-appointment-date";

const TimeseriesDataSource = new DataSource({
    ...defaultDataSourceOptions,
    database: "storage/ts.sqlite",
    entities: [AppointmentDate, CompressedAppointmentDate],
});

const log = logger.child({ module: "timeseries" });

export default TimeseriesDataSource;

export const initializeTimeseries = async () => {
    await TimeseriesDataSource.initialize()
        .then(async () => {
            log.debug("Initializing timeseries");
        })
        .catch(error =>
            log.error("Unable to initialize data source", { error }),
        );
};
