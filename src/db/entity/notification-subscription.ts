import { DateTime } from "luxon";
import { Entity, Column, Index, ManyToOne } from "typeorm";
import { JSONEncryptionTransformer } from "typeorm-encrypted";
import { Location } from "../../location/location";
import {
    MonitoringAccountSettings,
    normalizeMonitoringAccountSettings,
} from "../../monitoring/monitoring";
import { Nullable } from "../../utils/nullable";
import { EncryptionTransformerConfig } from "../utils/encryption-transformer";
import { AbstractSubscription } from "./abstract-subscription";
import { AppointmentSubscription } from "./appointment-subscription";
import { User } from "./user";

export type SubscriptionProvider = "cgi" | "ais";

export type CgiSubscriptionCredentials = {
    email: string;
    password: string;
};

export type AisSubscriptionCredentials = {
    email: string;
    password: string;
};

export type VisaPriority = "nonresident" | "regular";
export const defaultVisaPriority: VisaPriority = "nonresident";
export type SubscriptionCredentials =
    | CgiSubscriptionCredentials
    | AisSubscriptionCredentials;

export type AppointmentRange = {
    startAt: DateTime;
    endAt?: DateTime;
};

@Entity()
export class NotificationSubscription extends AbstractSubscription {
    @Column()
    @Index()
    provider!: SubscriptionProvider;

    @Column()
    @Index()
    city!: string;

    @Column({ default: false })
    @Index()
    anyCity!: boolean;

    public get location(): Location {
        return Location.byCity(this.city) || Location.Unknown;
    }

    public get country(): string {
        return this.location.country;
    }

    @Column({ default: 0 })
    @Index()
    members!: number;

    @Column({ default: defaultVisaPriority })
    @Index()
    priority!: VisaPriority;

    @Column({ default: false })
    @Index()
    paused!: boolean;

    public async pause() {
        this.paused = true;
        await this.save();
    }

    public async continue() {
        this.paused = false;
        await this.save();
    }

    @Column({ default: 1 })
    daysBeforeAppointment!: number;

    @Column("date", {
        nullable: true,
        transformer: {
            from(value) {
                return DateTime.fromSQL(value);
            },
            to(value) {
                return value?.toSQLDate();
            },
        },
    })
    startAt!: Nullable<DateTime>;

    @Column("date", {
        nullable: true,
        transformer: {
            from(value) {
                return DateTime.fromSQL(value);
            },
            to(value) {
                return value?.toSQLDate();
            },
        },
    })
    endAt!: Nullable<DateTime>;

    public get appointmentRange(): AppointmentRange {
        const zeroTime = {
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
        };

        const startDate = this.startAt?.isValid
            ? this.startAt
            : DateTime.now().set(zeroTime);

        const startAt = startDate.plus({
            days: 1 + this.daysBeforeAppointment,
        });

        return {
            startAt,
            endAt: this.endAt || undefined,
        };
    }

    public inRange(date: DateTime): boolean {
        return this.appointmentRange.startAt <= date;
    }

    @Column({
        type: "json",
        nullable: true,
        transformer: new JSONEncryptionTransformer(EncryptionTransformerConfig),
    })
    credentials!: SubscriptionCredentials;

    public get monitoringAccountSettings(): MonitoringAccountSettings {
        const settings: MonitoringAccountSettings =
            normalizeMonitoringAccountSettings(
                {
                    provider: this.provider,
                    city: this.city,
                    members: this.members,
                    priority: this.priority,
                },
                {
                    preserveCity: !this.anyCity,
                },
            );

        return settings;
    }

    @ManyToOne(() => User, (user: User) => user.notificationSubscriptions, {
        eager: true,
    })
    user!: User;

    public static make(
        user: User,
        location: Location,
    ): NotificationSubscription {
        const subscription = new NotificationSubscription();

        subscription.user = user;
        subscription.provider = location?.provider;
        subscription.city = location?.city;

        if (location?.provider === "ais") {
            subscription.anyCity = true;
        }

        return subscription;
    }

    public makeAppointmentSubscription(): AppointmentSubscription {
        const subscription = AppointmentSubscription.make(
            this.user,
            this.location,
        );

        subscription.paused = this.paused;
        subscription.city = this.city;
        subscription.anyCity = this.anyCity;

        subscription.credentials = this.credentials;
        subscription.members = this.members;
        subscription.priority = this.priority;

        subscription.daysBeforeAppointment = this.daysBeforeAppointment;
        subscription.startAt = this.startAt;
        subscription.endAt = this.endAt;

        return subscription;
    }

    public toJson() {
        return {
            activeUntil: this.activeUntil,
            city: this.city,
            country: this.country,
            anyCity: this.anyCity,
            members: this.members,
            priority: this.priority,
        };
    }
}
