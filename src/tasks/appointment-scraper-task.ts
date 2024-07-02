import { AppointmentSubscription } from "../db/entity/appointment-subscription";
import { SubscriptionProvider } from "../db/entity/notification-subscription";
import { Location } from "../location/location";
import type { ScraperInput, ScraperOutput } from "../scraper/common";
import { Scraper } from "../scraper/scraper";
import { ScraperTask } from "./scraper-task";

export const AIS_APPOINTMENT_SPAWN_EVENT = "ais-appointment-spawn";
export const AIS_APPOINTMENT_NOTIFY_EVENT = "ais-appointment-notify";

export abstract class AppointmentScraperTask<
    ScraperType extends Scraper<ScraperInput, ScraperOutput>,
    ScraperInputType extends ScraperInput,
> extends ScraperTask<ScraperType> {
    private provider: SubscriptionProvider;
    protected input: ScraperInputType;
    protected appointmentSubscription?: AppointmentSubscription;

    constructor(
        provider: SubscriptionProvider,
        input: ScraperInputType,
        appointmentSubscription?: AppointmentSubscription,
    ) {
        super();
        this.provider = provider;
        this.input = input;
        this.appointmentSubscription = appointmentSubscription;

        this.logger = this.logger.child({
            country: this.input.location.country.toUpperCase(),
            city: this.input.location.city.toUpperCase(),
        });
    }

    private get cities() {
        return Location.byCountry(this.input.location.country).map(l => l.city);
    }

    /**
     * REDACTED
     */
}
