import _ from "lodash";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Location } from "../../location/location";
import { AbstractSubscription } from "./abstract-subscription";
import { User } from "./user";

@Entity()
export class WidgetSubscription extends AbstractSubscription {
    @ManyToOne(() => User, (user: User) => user.widgetSubscriptions, {
        eager: true,
    })
    user!: User;

    @Column()
    @Index()
    country!: string;

    public get location(): Location {
        return Location.byCountry(this.country)?.[0] || Location.Unknown;
    }

    public static make(user: User, location: Location): WidgetSubscription {
        const subscription = new WidgetSubscription();

        subscription.user = user;
        subscription.country = location?.country;

        return subscription;
    }

    public toJson() {
        return {
            activeUntil: this.activeUntil,
            country: this.country,
        };
    }
}
