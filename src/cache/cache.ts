import Keyv from "keyv";
import KeyvFile from "keyv-file";

const options: Keyv.Options<unknown> = {
    namespace: process.env.APP_NAME || "cache",
};

const driver = process.env.CACHE_DRIVER;

switch (driver) {
    case "file": {
        options.store = new KeyvFile({
            filename: "storage/cache.json",
        });
        break;
    }
    case "sqlite": {
        options.uri = "sqlite://storage/cache.sqlite";
        break;
    }
    case "redis": {
        options.uri = "redis://localhost:6379";
        break;
    }
    default: {
        throw new Error(`Unknown cache driver '${driver}'`);
    }
}

export const cache = new Keyv(options);
