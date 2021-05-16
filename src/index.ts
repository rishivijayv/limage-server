import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { User } from './entities/User';
import { __prod__ } from './constants';
import { CustomContext } from './types';
import UserResolver from './resolvers/user';
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
import cors from "cors";


async function main(){

    await createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [ User ],
        synchronize: !__prod__,
        logNotifications: true
    });

    const app = express();
    
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true
        })
    )


    // Session middleware
    app.use(
        session({
            name: process.env.COOKIE_NAME,
            store: new RedisStore({ client: redisClient }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24, // 1 day
                httpOnly: true,
                secure: __prod__,
                sameSite: "lax"
            },
            secret: process.env.COOKIE_SECRET!,
            saveUninitialized: false,
            resave: false,

        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ UserResolver ],
            validate: false
        }),
        context: ({ req, res }): CustomContext => ({ req, res })
    });

    // Adding ApolloServer as a middleware to express
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log("Server now running at port 4000");
    });




}

main();