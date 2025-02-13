import { Client } from "pg";

require("dotenv").config()

const Database = new Client({
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    port: 5432,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    ssl: true
})

async function connectDatabase() {
        await Database.connect();
        console.log("Connection to Database successfull!!");
        return ;
    // if their exist any error it would automatically gets shown so no need to log it also on error the fucntion won't execute itself further
}

export {connectDatabase,Database}