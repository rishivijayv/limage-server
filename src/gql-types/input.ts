import { InputType, Field, Int } from "type-graphql";
import { Upload } from "../types"
import { GraphQLUpload } from "graphql-upload";

@InputType()
export class CredentialsInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@InputType()
export class ImageInput {
    @Field(() => GraphQLUpload)
    file: Upload

    @Field()
    label: string
}

@InputType()
export class ImageSaveInput {
    @Field(() => Int)
    imageId: number;

    @Field()
    labelName: string
}

@InputType()
export class DeleteLabelImageInput {
    @Field(() => Int)
    imageId: number;

    @Field(() => Int)
    labelId: number;
}

@InputType()
export class PaginatedInput {
    @Field(() => Int)
    limit: number

    @Field(() => String, { nullable: true })
    cursor: string | null

}