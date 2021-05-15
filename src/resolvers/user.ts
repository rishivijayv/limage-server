import { Resolver, Query, Mutation, ObjectType, Field, Arg } from "type-graphql";
import { User } from "../entities/User";
import { CredentialsInput } from "../gql-types/input";
import { InputError } from "../gql-types/error";
import { validateSignup } from '../utilities/validators';
import argon2 from "argon2";


@ObjectType()
class UserResponse {

    @Field(() => [InputError], { nullable: true })
    errors?: InputError[];

    @Field({ nullable: true })
    user?: User;
}


@Resolver()
export default class UserResolver {

    @Query(() => String)
    simple(){
        return "Hello there";
    }

    @Mutation(() => UserResponse)
    async signup(
        @Arg('credentials') credentials: CredentialsInput,
    ): Promise<UserResponse> {

        const nonDbErrors = validateSignup(credentials);

        if(nonDbErrors.length != 0){
            return { errors: nonDbErrors };
        }

        const hashedPassword = await argon2.hash(credentials.password);
        let user;

        try{
            user = await User.create({ username: credentials.username, password: hashedPassword }).save();
        }catch(error) {
            if(error.code === '23505'){
                return {
                    errors: [{
                        fieldName: "username",
                        description: "Username is already taken"
                    }]
                }
            }
        }
        
        return { user };

    }

}