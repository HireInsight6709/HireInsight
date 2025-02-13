"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.connectDatabase = void 0;
const pg_1 = require("pg");
require("dotenv").config();
const Database = new pg_1.Client({
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    port: 5432,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    ssl: true
});
exports.Database = Database;
function connectDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database.connect();
        console.log("Connection to Database successfull!!");
        return;
        // if their exist any error it would automatically gets shown so no need to log it also on error the fucntion won't execute itself further
    });
}
exports.connectDatabase = connectDatabase;
