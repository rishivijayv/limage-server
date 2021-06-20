import { Entity, ManyToOne, BaseEntity } from "typeorm";
import { Image } from "./Image";
import { UserLabel } from "./UserLabel";

@Entity()
export class LabelImage extends BaseEntity {

    @ManyToOne(() => UserLabel, userLabel => userLabel.id, {onDelete: "CASCADE", primary: true})
    userLabel!: UserLabel

    @ManyToOne(() => Image, image => image.id, { onDelete: "CASCADE", primary: true })
    image!: Image

}