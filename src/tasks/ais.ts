import { AppointmentSubscription } from "../db/entity/appointment-subscription";
import { ProxyPoolOptions } from "../proxy/pool";
import { AisScraper, AisScraperInput, AisScraperOutput } from "../scraper/ais";
import { ScraperMode } from "../scraper/scraper";
import { AppointmentScraperTask } from "./appointment-scraper-task";

export class Ais extends AppointmentScraperTask<AisScraper, AisScraperInput> {
    protected scraper: AisScraper;

    constructor(
        mode: ScraperMode,
        input: AisScraperInput,
        appointmentSubscription?: AppointmentSubscription,
    ) {
        super("ais", input, appointmentSubscription);

        this.scraper = new AisScraper(mode, {
            id: this.id,
            // headless: true,
        });
    }

    public static ProxyFilter = (): ProxyPoolOptions => {
        return {
            shuffle: true,
            filter: {
                countries: ["US"],
            },
        };
    };

    public async handle(): Promise<void> {
        /**
         * REDACTED
         */
    }

    public async error(): Promise<void> {
        await this.scraper.close();
    }
}
