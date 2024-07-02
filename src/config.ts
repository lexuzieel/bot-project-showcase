import { load, reload as reloadConfig } from "node-yaml-config";
import { MonitoringAccountSettings } from "./monitoring/monitoring";

export type Config = {
    features?: {
        earlyAccess?: boolean;
        subscription?: {
            appointment?: boolean;
            notification?: boolean;
            widget?: boolean;
        };
        widgetPromo?: boolean;
    };
    api?: {
        compression?: {
            enabled?: boolean;
            /**
             * Schedule in the format of a cron expression
             * @see https://crontab.guru
             */
            schedule?: string;
        };
        cache?: {
            enabled?: boolean;
            /**
             * TTL duration in human-readable format (i.e. 5s, 5m, 1h).
             * @see https://www.npmjs.com/package/ms
             */
            ttl?: string;
            /**
             * Value between 0 and 1 that defines the percentage of TTL,
             * after which cache will be refreshed in the background.
             */
            refreshAheadFactor?: number;
        };
    };
    monitoring?: {
        cgi?: {
            enabled?: boolean;
            schedule?: string;
            concurrency?: number;
        };
        ais?: {
            enabled?: boolean;
            schedule?: string;
            concurrency?: number;
        };
        timeoutMinutes?: number;
        accounts?: MonitoringAccountSettings[];
        healthcheck?: {
            enabled?: boolean;
        };
    };
};

const path = __dirname + "/../config/config.yml";

const env = process.env.NODE_ENV || "development";

let config = load(path, env) as Config;

export default config;

export const reload = () => {
    config = reloadConfig(path, env);
};
