import _ from "lodash";
import config from "../config";
import {
    VisaPriority,
    SubscriptionProvider,
} from "../db/entity/notification-subscription";
import { Location } from "../location/location";

export type MonitoringAccountSettings = {
    provider: SubscriptionProvider;
    city: string;
    members: number;
    priority: VisaPriority;
};

export const normalizeMonitoringAccountSettings = (
    settings: MonitoringAccountSettings,
    options: {
        preserveCity?: boolean;
    } = {
        preserveCity: false,
    },
): MonitoringAccountSettings => {
    const account = _.clone(settings);

    // For AIS monitoring always use the first city
    // for the given country. This avoids duplicate
    // monitoring accounts for the same country.
    if (account.provider == "ais" && !options.preserveCity) {
        const cities = Location.byCountry(
            Location.byCity(account.city)?.country || "",
        );

        account.city = cities[0].city;
    }

    return account;
};

export async function getMonitoringAccountSettings() {
    return (
        _.shuffle(
            _.map(config.monitoring?.accounts, account =>
                normalizeMonitoringAccountSettings(account),
            ),
        ) || []
    );
}
