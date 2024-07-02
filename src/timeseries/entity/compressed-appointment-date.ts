import { Entity, PrimaryColumn, Index } from "typeorm";
import {
    VisaPriority,
    defaultVisaPriority,
} from "../../db/entity/notification-subscription";
import { BaseDataPoint } from "./appointment-date";

@Entity()
export class CompressedAppointmentDate extends BaseDataPoint {
    @PrimaryColumn()
    @Index()
    city!: string;

    @PrimaryColumn("date")
    @Index()
    date!: Date;

    @PrimaryColumn({ default: 0 })
    @Index()
    members!: number;

    @PrimaryColumn({ default: defaultVisaPriority })
    @Index()
    priority!: VisaPriority;
}
