import { ObjectType, Field } from "type-graphql";
import { EntityTarget } from "typeorm";

export default function GenerateGqlPaginatedResponse<T>(PaginatedDataType: EntityTarget<T>, typeName: string) {
    @ObjectType(`Paginated${typeName}Response`)
    class PaginatedResponseClass<T> {
        @Field(() => [PaginatedDataType])
        entities: T[]
    
        @Field()
        hasMore: boolean
    }

    return PaginatedResponseClass
}