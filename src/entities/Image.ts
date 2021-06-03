import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Field, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
export class Image extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    location!: string;

    @Field()
    @Column()
    label!: string;

    @ManyToOne(() => User, user => user.images)
    user!: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

}