import { Resolver, Query, Mutation, ObjectType, Field, Arg, Ctx } from "type-graphql";
import { User } from "../entities/User";
import { CredentialsInput } from "../gql-types/input";
import { InputError } from "../gql-types/error";
import { validateSignup } from '../utilities/validators';
import argon2 from "argon2";
import { CustomContext } from "../types";


@ObjectType()
class UserResponse {

    @Field(() => [InputError], { nullable: true })
    errors?: InputError[];

    @Field({ nullable: true })
    user?: User;
}


@Resolver()
export default class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: CustomContext
    ) {
        if(req.session.userId){
            const currUser = await User.findOne(
                {
                    where: { id: req.session.userId }
                }
            );

            return currUser
        }else{
            // User not logged in
            return null
        }        
    }

    @Mutation(() => UserResponse)
    async signup(
        @Ctx() { req }: CustomContext,
        @Arg('credentials') credentials: CredentialsInput
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
        

        // Keep user logged in after they have just signedup
        req.session.userId = user?.id;

        return { user };

    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('credentials') credentials: CredentialsInput,
        @Ctx() { req }: CustomContext
    ): Promise<UserResponse> {
        const user = await User.findOne({
            where: {
                username: credentials.username
            }
        });

        if(!user){
            return {
                errors: [{
                    fieldName: "username",
                    description: "The Username does not exist"
                }]
            }
        }

        const validPassword = await argon2.verify(user.password, credentials.password);
        if(!validPassword){
            return {
                errors: [{
                    fieldName: "password",
                    description: "The password is not valid"
                }]
            }
        }


        req.session.userId = user.id;
        // Username exists and the password is valid. Allow to login and return the current user
        return { user };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: CustomContext
    ): Promise<Boolean> {
        return new Promise(resolve => {
            req.session.destroy(err => {
                res.clearCookie(process.env.COOKIE_NAME!);
                if(err){
                    console.log(err);
                    resolve(false);
                }else{
                    resolve(true);
                }
            });
        });
    }

}