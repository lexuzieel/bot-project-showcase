# TypeScript code quality and architecture showcase project

This is a cleaned up version of a proprietary project for resume showcase.

Because of this some of the functionality is redacted. This project is for code
demonstration purposes only.

## Project features

-   Environment specific-configuration (config/config.yml)
-   Environment variables (.env)
-   Abstract entity inheritance (subscription entities)
-   [TypeORM](https://typeorm.io) usage (regular entities & timeseries data)
-   Logging using [winston](https://github.com/winstonjs/winston)
-   Scheduled tasks & in-memory queue workers using [fastq](https://github.com/mcollina/fastq)
-   Caching with different cache drivers (file, redis, sqlite)
-   Telegram bot using [Grammy](https://grammy.dev) library
-   HTTP server using [Express](https://expressjs.com) library
-   Websocket server using [Socket.io](https://socket.io/) library
-   Authentication using [Telegram auth](https://core.telegram.org/widgets/login)

## Application bootstrapping

`index.js` is the entrypoint where all the services are bootstrapped:

```ts
dotenv.config();

Settings.defaultZone = "UTC";

async function main() {
    logger.info("Starting the application...");

    await initializeLocalization();

    await initializeDatabase();
    await initializeTimeseries();

    await bot.start();

    worker.start();
    scheduler.start();

    await scheduleTasks();

    server.install(yookassa);
    server.install(widget);
    server.install(ws);
    server.start();

    logger.info("Application has started");
}

main();
```
