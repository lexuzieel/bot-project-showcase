import _ from "lodash";
import { Proxy, ProxyFilter, fetchProxies } from "./proxy";

export type ProxyPoolOptions = {
    shuffle?: boolean;
    filter?: ProxyFilter;
};

export class Pool {
    private cursor = 0;
    private proxies: Proxy[] = [];
    private options?: ProxyPoolOptions;

    constructor(options?: ProxyPoolOptions) {
        this.options = options;
    }

    public next(): Proxy {
        const proxy = this.proxies[this.cursor++];
        this.cursor %= this.proxies.length;
        return proxy;
    }

    public reset(): void {
        this.cursor = 0;
    }

    public random(): Proxy {
        return this.proxies[Math.floor(Math.random() * this.proxies.length)];
    }

    public count(): number {
        return this.proxies.length;
    }

    public async refresh() {
        let proxies = await fetchProxies(this.options?.filter);

        if (this.options?.shuffle) {
            proxies = _.shuffle(proxies);
        }

        this.proxies = proxies;
    }

    public static async create(options?: ProxyPoolOptions): Promise<Pool> {
        const pool = new Pool(options);
        await pool.refresh();

        return pool;
    }
}
