import { Entity, ManyToOne, BaseEntity, CreateDateColumn, Column, JoinColumn } from "typeorm";
import { Image } from "./Image";
import { UserLabel } from "./UserLabel";

@Entity()
export class LabelImage extends BaseEntity {

    @Column({ name: "userLabelId", primary: true })
    userLabelId: number;

    @Column({ name: "imageId", primary: true })
    imageId: number;

    @ManyToOne(() => UserLabel, userLabel => userLabel.id, {onDelete: "CASCADE"})
    @JoinColumn({ name: "userLabelId" })
    userLabel!: UserLabel;

    @ManyToOne(() => Image, image => image.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "imageId" })
    image!: Image;



    @CreateDateColumn()
    createdAt: Date;


}