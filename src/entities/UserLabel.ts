import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn } from "typeorm";
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

    @ManyToOne(() => User, user => user.labels, { onDelete: "CASCADE" })
    user!: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

}