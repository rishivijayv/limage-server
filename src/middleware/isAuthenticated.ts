import { MiddlewareFn } from "type-graphql";
import { CustomContext } from "../types";

export const isAuthenticated: MiddlewareFn<CustomContext> = ({ context }, next) => {
    if(!context.req.session.userId){
        throw new Error("Unauthorized");
    }

    return next();
};