import { DateTime } from "luxon";
import {
    Entity,
    Column,
    PrimaryColumn,
    BaseEntity,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Nullable } from "../../utils/nullable";
import { uniqueId } from "../../utils/unique-id";

@Entity()
export abstract class AbstractSubscription extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @BeforeInsert()
    generateUniqueId() {
        this.id = uniqueId();
    }

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "datetime", nullable: true })
    activatedAt!: Nullable<Date>;

    @Column("date", {
        nullable: true,
        transformer: {
            from(value) {
                return DateTime.fromSQL(value);
            },
            to(value) {
                return value instanceof DateTime ? value?.toSQLDate() : value;
            },
        },
    })
    activeUntil!: Nullable<DateTime>;

    public get active(): boolean {
        return this.activatedAt !== null && !this.expired;
    }

    public get expired(): boolean {
        return (
            this.activeUntil != null &&
            this.activeUntil.diffNow("days").days < -1
        );
    }

    public async invoice(): Promise<Invoice | null> {
        return await Invoice.findOne({
            where: [
                {
                    appointmentSubscription: {
                        id: this.id,
                    },
                },
                {
                    notificationSubscription: {
                        id: this.id,
                    },
                },
                {
                    widgetSubscription: {
                        id: this.id,
                    },
                },
            ],
        });
    }
}
