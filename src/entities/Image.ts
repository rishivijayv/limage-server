import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Field, ObjectType, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Image {

    @Field()
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    location: string;

    @Field()
    @Column()
    label: string;

    @Field(() => Int)
    @ManyToOne(() => User, user => user.images)
    user: User;

}