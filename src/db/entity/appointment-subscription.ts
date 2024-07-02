import { Entity, Column, ManyToOne, Index } from "typeorm";
import { Location } from "../../location/location";
import { NotificationSubscription } from "./notification-subscription";
import { User } from "./user";

@Entity()
export class AppointmentSubscription extends NotificationSubscription {
    @ManyToOne(() => User, (user: User) => user.appointmentSubscriptions, {
        eager: true,
    })
    user!: User;

    @Column({ default: 0 })
    failureCount!: number;

    @Column({ nullable: true })
    @Index()
    doneAt!: Date;

    public async markAsDone() {
        this.doneAt = new Date();
        await this.save();
    }

    public static make(
        user: User,
        location: Location,
    ): AppointmentSubscription {
        const subscription = new AppointmentSubscription();

        subscription.user = user;
        subscription.provider = location?.provider;
        subscription.city = location?.city;

        return subscription;
    }
}
