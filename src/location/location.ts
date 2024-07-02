import _ from "lodash";
import { CustomContext } from "../bot/context";
import { SubscriptionProvider } from "../db/entity/notification-subscription";
import { GrammaticalCase, t, transformCase } from "../utils/localization";
import { City } from "./cities";
import { codes } from "./codes";
import { Country } from "./countries";
import { flags } from "./flags";

export class Location {
    private _city: string;
    private _country: string;
    private _provider: SubscriptionProvider;

    constructor(city: string, country: string, provider: SubscriptionProvider) {
        this._city = city.toLowerCase();
        this._country = country.toLowerCase();
        this._provider = provider;
    }

    public get city(): string {
        return this._city;
    }

    public get country(): string {
        return this._country;
    }

    public get provider(): SubscriptionProvider {
        return this._provider;
    }

    public toString(): string {
        return Location.format(this._country, this._city);
    }

    public equals(other: Location): boolean {
        return this._country === other._country && this._city === other._city;
    }

    public static format(country: string, city: string): string {
        return `(${country}, ${city})`;
    }

    public get flag(): string {
        return flags.get(this._country) || "🏴󠁧󠁢󠁮󠁩󠁲󠁿";
    }

    public name(
        ctx?: CustomContext,
        options: {
            flag: boolean;
            grammaticalCase?: GrammaticalCase;
        } = {
            flag: true,
        },
    ): string {
        const translate = ctx ? ctx.t : t;

        const city =
            translate(`city.${_.kebabCase(this._city)}`) ||
            translate("city") ||
            this._city;

        return `${options.flag ? this.flag : ""} ${transformCase(
            city,
            options.grammaticalCase,
        )}`.trimStart();
    }

    public localizedCountryName(ctx?: CustomContext, showFlag = true): string {
        const translate = ctx ? ctx.t : t;
        const flag = showFlag ? `${this.flag} ` : "";

        return (
            flag +
            (translate(`country.${this._country}`) ||
                translate("country") ||
                this._country)
        );
    }

    public get code(): string {
        return (
            codes.get(this._country) ||
            this._country.substring(0, 2).toLowerCase()
        );
    }

    public static byCity(city: string): Location | undefined {
        return locations.find(
            l => l._city.toLowerCase() === city.toLowerCase(),
        );
    }

    public static byCountry(country: string): Location[] {
        return locations.filter(
            l => l._country.toLowerCase() === country.toLowerCase(),
        );
    }

    public static byProvider(provider: SubscriptionProvider): Location[] {
        return locations.filter(
            l => l._provider.toLowerCase() === provider.toLowerCase(),
        );
    }

    public static get list(): Location[] {
        return locations;
    }

    public static get Unknown(): Location {
        return new Location("unknown", "unknown", "cgi");
    }
}

export const locations: Location[] = [
    new Location(City.YEREVAN, Country.ARMENIA, "ais"),
    new Location(City.ANKARA, Country.TURKEY, "ais"),
    new Location(City.ISTANBUL, Country.TURKEY, "ais"),
    new Location(City.BELGRADE, Country.SERBIA, "ais"),
    new Location(City.ASTANA, Country.KAZAKHSTAN, "ais"),
    new Location(City.ALMATY, Country.KAZAKHSTAN, "ais"),
    new Location(City.WARSAW, Country.POLAND, "cgi"),
    new Location(City.KRAKOW, Country.POLAND, "cgi"),
    new Location(City.JAKARTA, Country.INDONESIA, "cgi"),
    new Location(City.SURABAYA, Country.INDONESIA, "cgi"),
    new Location(City.BANGKOK, Country.THAILAND, "cgi"),
    new Location(City.CHIANG_MAI, Country.THAILAND, "cgi"),
    new Location(City.DOHA, Country.QATAR, "cgi"),
    new Location(City.KUALA_LUMPUR, Country.MALAYSIA, "cgi"),
    new Location(City.TUNIS, Country.TUNISIA, "cgi"),
    new Location(City.CALGARY, Country.CANADA, "ais"),
    new Location(City.HALIFAX, Country.CANADA, "ais"),
    new Location(City.MONTREAL, Country.CANADA, "ais"),
    new Location(City.OTTAWA, Country.CANADA, "ais"),
    new Location(City.QUEBEC_CITY, Country.CANADA, "ais"),
    new Location(City.TORONTO, Country.CANADA, "ais"),
    new Location(City.VANCOUVER, Country.CANADA, "ais"),
    new Location(City.ULAANBAATAR, Country.MONGOLIA, "cgi"),
    new Location(City.ASUNCION, Country.PARAGUAY, "ais"),
    new Location(City.BUENOS_AIRES, Country.ARGENTINA, "ais"),
    new Location(City.PARIS, Country.FRANCE, "ais"),
    new Location(City.CIUDAD_JUAREZ, Country.MEXICO, "ais"),
    new Location(City.GUADALAJARA, Country.MEXICO, "ais"),
    new Location(City.HERMOSILLO, Country.MEXICO, "ais"),
    new Location(City.MATAMOROS, Country.MEXICO, "ais"),
    new Location(City.MERIDA, Country.MEXICO, "ais"),
    new Location(City.MEXICO_CITY, Country.MEXICO, "ais"),
    new Location(City.MONTERREY, Country.MEXICO, "ais"),
    new Location(City.NOGALES, Country.MEXICO, "ais"),
    new Location(City.NUEVO_LAREDO, Country.MEXICO, "ais"),
    new Location(City.TIJUANA, Country.MEXICO, "ais"),
];

export const countries = _.uniqBy(locations, l => l.country);
