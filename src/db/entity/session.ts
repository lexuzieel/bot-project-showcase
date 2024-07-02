import {
    Entity,
    BaseEntity,
    JoinColumn,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    Index,
    Column,
} from "typeorm";
import { User } from "./user";

@Entity()
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Index()
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    @Index()
    expiresAt!: Date;

    @ManyToOne(() => User, (user: User) => user.sessions)
    @JoinColumn()
    @Index()
    user!: User;
}
