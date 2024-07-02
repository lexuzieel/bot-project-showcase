import { Mutex } from "async-mutex";
import { Pool, ProxyPoolOptions } from "../proxy/pool";
import { Proxy, getFilterHash } from "../proxy/proxy";
import { Task } from "../queue/task";
import { Scraper } from "../scraper/scraper";
import logger from "../utils/logger";

const proxyPoolRefreshInterval = 15 * 60 * 1000; // Fifteen minutes

export abstract class ScraperTask<
    ScraperType extends Scraper<unknown, unknown>,
> extends Task {
    protected abstract scraper: ScraperType;

    private static proxyPoolMutex = new Mutex();
    private static proxyPools: Map<string, Pool> = new Map();
    private static lastPoolRefresh = Date.now();

    // Here we define a "deadzone" within which we will not
    // attempt to schedule or notify the same subscription.
    protected static duplicateScheduleDeadzone = "1m";

    /**
     * Returns a Promise that resolves to a proxy pool based on the provided
     * options.
     * This method locks with the mutex to avoid race condition while attempting
     * to create multiple pools with the same options.
     *
     * @param {ProxyPoolOptions} [options] - Options for the underlying proxy pool.
     * @returns {Promise<Pool | undefined>} A Promise that resolves to the proxy pool or undefined if not found.
     */
    private static async getProxyPool(
        options?: ProxyPoolOptions,
    ): Promise<Pool | undefined> {
        return await ScraperTask.proxyPoolMutex.runExclusive(
            async (): Promise<Pool | undefined> => {
                const hash = getFilterHash(options?.filter);

                const outdated =
                    ScraperTask.lastPoolRefresh <
                    Date.now() - proxyPoolRefreshInterval;

                if (outdated) {
                    logger.debug("Refreshing scraper task proxy pool...", {
                        filter: hash,
                    });
                }

                if (!ScraperTask.proxyPools.has(hash) || outdated) {
                    ScraperTask.proxyPools.set(
                        hash,
                        await Pool.create(options),
                    );

                    ScraperTask.lastPoolRefresh = Date.now();
                }

                return ScraperTask.proxyPools.get(hash);
            },
        );
    }

    /**
     * Asynchronously retrieves a proxy from the pool if available.
     * This method is thread safe.
     *
     * @param {ProxyPoolOptions} options - Options for the underlying proxy pool.
     * @return {Promise<Proxy | undefined>} a Promise that resolves with a Proxy object or undefined if pool is empty.
     */
    public static async getProxy(
        options?: ProxyPoolOptions,
    ): Promise<Proxy | undefined> {
        const pool = await this.getProxyPool(options);

        if (!pool) {
            return;
        }

        return pool.next();
    }

    /**
     * Sets the next available proxy for the given scraper from the proxy pool
     * that is created using the provided options.
     * When the end of the pool is reached, the cycle starts again in a
     * round-robin fashion.
     *
     * @param {Scraper<unknown, unknown>} scraper - The scraper to set the proxy for.
     * @param {ProxyPoolOptions} [options] - Options for the underlying proxy pool.
     * @throws Will throw an error if no proxies are available for the given filter.
     */
    protected async setProxy(options?: ProxyPoolOptions) {
        const proxy = await ScraperTask.getProxy(options);

        if (proxy) {
            this.logger = this.logger.child({ proxy: proxy.server });
            this.logger.debug("Using proxy: " + proxy.server);
            this.scraper?.withProxy(proxy);
        } else {
            const filter = JSON.stringify(options?.filter || {});
            throw new Error("No proxies available for filter: " + filter);
        }
    }

    public static async getProxyCount(
        options?: ProxyPoolOptions,
    ): Promise<number> {
        return (await this.getProxyPool(options))?.count() || 0;
    }
}
