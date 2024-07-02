import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import logger from "../utils/logger";
import { AppointmentSubscription } from "./entity/appointment-subscription";
import { Invoice } from "./entity/invoice.ts.bak";
import { NotificationSubscription } from "./entity/notification-subscription";
import { Session } from "./entity/session";
import { User } from "./entity/user";
import { WidgetSubscription } from "./entity/widget-subscription";

dotenv.config();

export const defaultDataSourceOptions: SqliteConnectionOptions = {
    type: "sqlite",
    database: "storage/default.sqlite",
    /**
     * Do not automatically synchronize schema in production unless specified
     * explicitly.
     */
    synchronize:
        process.env.NODE_ENV != "production" ||
        process.env.SCHEMA_SYNC == "true",
    logging: false,
    /**
     * Set busy timeout to 5 seconds to avoid conflict with litestream.
     * See more: https://litestream.io/tips/#busy-timeout
     */
    busyTimeout: 5000,
    namingStrategy: new SnakeNamingStrategy(),
};

const AppDataSource = new DataSource({
    ...defaultDataSourceOptions,
    database: "storage/db.sqlite",
    entities: [
        User,
        Session,
        Invoice,
        AppointmentSubscription,
        NotificationSubscription,
        WidgetSubscription,
    ],
});

const log = logger.child({ module: "db" });

export default AppDataSource;

export const initializeDatabase = async () => {
    await AppDataSource.initialize()
        .then(async () => {
            log.debug("Initializing data source");
        })
        .catch(error =>
            log.error("Unable to initialize data source", { error }),
        );
};
