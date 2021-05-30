import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { graphqlUploadExpress } from "graphql-upload";
import { User } from './entities/User';
import { __prod__ } from './constants';
import { CustomContext } from './types';
import { Uploader } from './utilities/uploader';
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

    // Upload middleware from graphql-upload
    app.use(graphqlUploadExpress({ maxFileSize: 2000000, maxFiles: 1 }));

    const uploader = new Uploader({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        destinationBucketName: process.env.AWS_S3_BUCKET_NAME!,
        region: process.env.AWS_S3_REGION!
    });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ UserResolver ],
            validate: false
        }),
        context: ({ req, res }): CustomContext => ({ req, res, uploader }),
        uploads: false
    });

    // Adding ApolloServer as a middleware to express
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log("Server now running at port 4000");
    });



}

main();