import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { User } from './entities/User';
import { __prod__ } from './constants';
import { CustomContext } from './types';
import UserResolver from './resolvers/user';



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

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ UserResolver ],
            validate: false
        }),
        context: ({ req, res }): CustomContext => ({ req, res })
    });

    // Adding ApolloServer as a middleware to express
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("Server now running at port 4000");
    });




}

main();