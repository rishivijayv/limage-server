import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Field, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
export class UserLabel extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    labelName!: string;

    @Column({ name: "userId" })
    userId: number

    @ManyToOne(() => User, user => user.labels, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

}