import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class InputError {
    @Field()
    fieldName: string;

    @Field()
    description: string;
}