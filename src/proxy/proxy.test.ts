import Proxy6 from "@visa-cat/node-proxy6";
import { describe, expect, test, vi } from "vitest";
import { fetchProxies } from "./proxy";

vi.spyOn(Proxy6.prototype, "getProxy").mockImplementation(async () => {
    return {
        "1": {
            id: "1",
            ip: "127.0.0.1",
            port: "1111",
            user: "Username",
            pass: "Password",
            type: "http",
            country: "us",
        },
        "2": {
            id: "2",
            ip: "127.0.0.1",
            port: "2222",
            user: "Username",
            pass: "Password",
            type: "socks5",
            country: "us",
        },
        "3": {
            id: "3",
            ip: "127.0.0.1",
            port: "3333",
            user: "Username",
            pass: "Password",
            type: "http",
            country: "ru",
        },
    };
});

describe("proxy", () => {
    test("fetch all proxies", async () => {
        const proxies = await fetchProxies();
        expect(proxies).toHaveLength(3);
    });

    test("fetch proxies filtered by type", async () => {
        let proxies = await fetchProxies({
            type: "socks5",
        });
        expect(proxies).toHaveLength(1);

        proxies = await fetchProxies({
            type: "http",
        });
        expect(proxies).toHaveLength(2);
    });

    test("fetch proxies filtered by country", async () => {
        let proxies = await fetchProxies({
            countries: ["us"],
        });
        expect(proxies).toHaveLength(2);

        proxies = await fetchProxies({
            countries: ["ru"],
        });
        expect(proxies).toHaveLength(1);
    });
});
