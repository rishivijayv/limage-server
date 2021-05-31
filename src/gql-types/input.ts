import { InputType, Field } from "type-graphql";
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