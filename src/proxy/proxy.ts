import crypto from "crypto";
import _ from "lodash";
import { DateTime } from "luxon";
import baseLogger from "../utils/logger";

const logger = baseLogger.child({ scope: "proxy" });

export class Proxy {
    public server: string;
    public username?: string;
    public password?: string;

    /**
     * @param server Proxy address in the format: http://127.0.0.1:8080
     * @param username Optional username
     * @param password Optional password
     */
    constructor(server: string, username?: string, password?: string) {
        this.server = server;
        this.username = username;
        this.password = password;
    }

    public toString(): string {
        return this.server;
    }
}

export type ProxyType = "http" | "socks5";

export type ProxyFilter = {
    type?: ProxyType;
    countries?: string[];
};

export const getFilterHash = (filter?: ProxyFilter): string => {
    return crypto
        .createHash("md5")
        .update(JSON.stringify(filter || {}))
        .digest("hex");
};

export const fetchProxies = async (filter?: ProxyFilter): Promise<Proxy[]> => {
    const hash = getFilterHash(filter);

    logger.debug("Fetching proxies...", { filter: hash });

    const proxies: Proxy[] = [];

    /**
     * REDACTED
     */
    const api = new ProxyApi(process.env.PROXY_API_KEY);
    let data = await api.getProxy("active");

    const daysBeforeExpiration = 3;
    const minimumProxies = 4;

    let expiringProxyCount = 0;

    data = _.filter(data, (entry: { unixtime_end: number }) => {
        const daysRemaining = DateTime.fromSeconds(entry.unixtime_end).diffNow(
            "days",
        ).days;

        if (daysRemaining < daysBeforeExpiration) {
            expiringProxyCount++;
        }

        return daysRemaining >= daysBeforeExpiration;
    });

    if (filter?.type) {
        data = _.filter(data, { type: filter.type.toLowerCase() });
    }

    if (filter?.countries) {
        filter.countries = _.map(filter.countries, c => c.toLowerCase());

        data = _.filter(data, item =>
            _.includes(filter?.countries, item.country),
        );
    }

    // Map API response to a list of Proxy objects
    for (const id in data) {
        const proxy = data[id];
        proxies.push(
            new Proxy(
                `${proxy.type}://${proxy.ip}:${proxy.port}`,
                proxy.user,
                proxy.pass,
            ),
        );
    }

    logger.debug(
        `Found ${proxies.length} proxies (${minimumProxies} minimum, ${expiringProxyCount} expiring)`,
        { filter: hash },
    );

    if (proxies.length < minimumProxies) {
        const count = minimumProxies - proxies.length;

        logger.warn(
            `Proxy count is lower than threshold, trying to order ${count} additional proxies`,
        );

        let orderedCount = 0;

        for (let i = 0; i < count; i++) {
            try {
                const period = 30;
                const country = _.first(filter?.countries)?.toLowerCase();
                const version = 3; // IPv4 Shared
                const type = filter?.type || "http";

                logger.debug(`Trying to order additional proxy...`, {
                    period,
                    country,
                    version,
                    type,
                });

                await api.buy(1, period, country, "", version, type);

                orderedCount++;

                logger.info(`Successfully ordered additional proxy`);
            } catch (e) {
                const err = e as Error;
                logger.error(err);
            }
        }

        if (orderedCount > 0) {
            const failedCount = count - orderedCount;
        }
    }

    return proxies;
};
