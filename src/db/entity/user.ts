import _ from "lodash";
import {
    Entity,
    Column,
    Index,
    PrimaryColumn,
    BaseEntity,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    AfterLoad,
    Not,
    IsNull,
    MoreThanOrEqual,
} from "typeorm";
import { today } from "../../utils/date";
import logger from "../../utils/logger";
import { uniqueId } from "../../utils/unique-id";
import { AppointmentSubscription } from "./appointment-subscription";
import { NotificationSubscription } from "./notification-subscription";
import { Session } from "./session";
import { WidgetSubscription } from "./widget-subscription";

export type UserSource = "telegram" | "widget";

export type UserProfile = Pick<
    User,
    "id" | "firstName" | "lastName" | "username"
> & {
    subscriptions?: {
        notification?: object[];
        widget?: object[];
    };
};

@Entity()
export class User extends BaseEntity {
    private logger = logger.child({ module: "user" });

    @PrimaryColumn()
    id!: string;

    @AfterLoad()
    setLoggerUser() {
        this.logger = this.logger.child({ user: this.id });
    }

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column()
    @Index({ unique: true })
    telegramId!: number;

    @Column({ default: "telegram" })
    @Index()
    source!: UserSource;

    @Column({ nullable: true })
    @Index()
    lastMessageId!: number;

    @BeforeInsert()
    @BeforeUpdate()
    generateUniqueId() {
        this.id = uniqueId(this.telegramId);
    }

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @Column({ nullable: true })
    username?: string;

    @OneToMany(
        () => AppointmentSubscription,
        (subscription: AppointmentSubscription) => subscription.user,
    )
    appointmentSubscriptions!: AppointmentSubscription[];

    @OneToMany(
        () => NotificationSubscription,
        (notificationSubscriptions: NotificationSubscription) =>
            notificationSubscriptions.user,
    )
    notificationSubscriptions!: NotificationSubscription[];

    @OneToMany(
        () => WidgetSubscription,
        (widgetSubscriptions: WidgetSubscription) => widgetSubscriptions.user,
    )
    widgetSubscriptions!: WidgetSubscription[];

    @OneToMany(() => Session, session => session.user)
    sessions!: Session[];

    public get fullName(): string {
        let name = `${this.firstName}`;

        if (this.lastName) {
            name += ` ${this.lastName}`;
        }

        if (this.username) {
            name += ` (@${this.username})`;
        }

        return name;
    }

    public get hadPromoWidgetSubscription(): boolean {
        return _.map(this.widgetSubscriptions, "country").includes("promo");
    }

    public async toJson(): Promise<UserProfile> {
        const widgetSubscriptions = await WidgetSubscription.find({
            where: {
                activatedAt: Not(IsNull()),
                activeUntil: MoreThanOrEqual(today()),
                user: {
                    id: this.id,
                },
            },
        });

        const notificationSubscriptions = await NotificationSubscription.find({
            where: {
                activatedAt: Not(IsNull()),
                activeUntil: MoreThanOrEqual(today()),
                user: {
                    id: this.id,
                },
            },
        });

        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            subscriptions: {
                widget: _.map(widgetSubscriptions, s => s.toJson()),
                notification: _.map(notificationSubscriptions, s => s.toJson()),
            },
        };
    }
}
