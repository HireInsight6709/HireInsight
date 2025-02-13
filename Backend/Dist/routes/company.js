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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Database_1 = require("../Databases/Database");
const token_auth_1 = require("../Authentication/token_auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const CompanyRoute = express_1.default.Router();
CompanyRoute.use((0, cookie_parser_1.default)());
const query = `INSERT INTO "Jobs" ("role_name","department","location","description","skills","experience","job_type","max_salary","min_salary","start_date","end_date","post_status","company_id") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
CompanyRoute.post("/api/v1/dashboard/company/jobPost", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Job Post request recieved !!");
    const Data = req.body.data;
    console.log("Data is :", Data);
    console.log('req.user value is : ', req.user);
    const value = [Data.jobRole, Data.department, Data.location, Data.description, Data.skills, Data.experience, Data.jobType, Data.salaryMax, Data.salaryMin, Data.startDate, Data.endDate, 'Active', req.user.id];
    try {
        const response = yield Database_1.Database.query(query, value);
        resp.status(200).json({
            message: "The job post request was sucessfull!!"
        });
        return;
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Server was not able to compelte the request !!"
        });
        return;
    }
}));
exports.default = CompanyRoute;
