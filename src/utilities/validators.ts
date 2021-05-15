import { CredentialsInput } from '../gql-types/input';
import { InputError } from "../gql-types/error";

export function validateSignup(credentials: CredentialsInput): InputError[] {

    let errors: InputError[] = [];

    if(credentials.username.length <= 4){
        errors.push({
            fieldName: "username",
            description: "Username must be atleast 5 characters"
        });
    }

    if(credentials.password.length <= 6){
        errors.push({
            fieldName: "password",
            description: "Password must be atleast 7 characters"
        });
    }

    return errors;


}
