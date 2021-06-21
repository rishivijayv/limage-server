import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn, JoinColumn } from "typeorm";
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

    @Column({ name: "userId" })
    userId: number

    @ManyToOne(() => User, user => user.images, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

}