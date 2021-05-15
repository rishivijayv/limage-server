import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from './entities/User';
import { __prod__ } from './constants';

async function main(){

    const con = await createConnection({
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


}

main();