import {
    Entity,
    BaseEntity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    Index,
} from "typeorm";
import {
    VisaPriority,
    SubscriptionProvider,
    defaultVisaPriority,
} from "../../db/entity/notification-subscription";
import { Nullable } from "../../utils/nullable";

@Entity()
export class BaseDataPoint extends BaseEntity {
    @PrimaryColumn()
    ts!: Date;

    @BeforeInsert()
    generateUniqueId() {
        this.ts = new Date();
    }
}

@Entity()
export class AppointmentDate extends BaseDataPoint {
    @Column()
    provider!: SubscriptionProvider;

    @Column()
    @Index()
    city!: string;

    @Column("date", { nullable: true })
    @Index()
    date!: Nullable<Date>;

    @Column({ default: 0 })
    @Index()
    members!: number;

    @Column({ default: defaultVisaPriority })
    @Index()
    priority!: VisaPriority;

    public static make(
        provider: SubscriptionProvider,
        city: string,
        date: Nullable<Date>,
        members = 0,
        priority: VisaPriority,
    ): AppointmentDate {
        const appointmentDate = new AppointmentDate();
        appointmentDate.provider = provider;
        appointmentDate.city = city;
        appointmentDate.date = date;
        appointmentDate.members = members;
        appointmentDate.priority = priority;
        return appointmentDate;
    }
}
