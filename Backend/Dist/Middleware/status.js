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
const token_auth_1 = require("../Authentication/token_auth");
const Database_1 = require("../Databases/Database");
const ApplicationStatus = express_1.default.Router();
const query1 = `SELECT ("job_Id") FROM "Applications" WHERE "candidate_Id" = $1 AND "role" = $2`;
ApplicationStatus.get("/api/v1/status", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("On status Page");
    try {
        const response = yield Database_1.Database.query(query1, [req.user.id, req.user.role]);
        const jobs = response.rows;
        const updatedJobId = jobs.map((job) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(job);
            const jobDetailResponse = yield Database_1.Database.query(`SELECT "role_name", "company_id" FROM "Jobs" WHERE "id" = $1`, [job.job_Id]);
            const jobDetail = jobDetailResponse.rows[0];
            console.log(jobDetail);
            const comapnyDetailResponse = yield Database_1.Database.query(`SELECT "companyName" FROM "Company" WHERE "company_Id" = $1`, [jobDetail.company_id]);
            const comapnyDetail = comapnyDetailResponse.rows[0];
            // Replace the `id` with the fetched job detail
            return Object.assign(Object.assign({}, jobDetail), comapnyDetail);
        }));
        console.log("Updated jobs are:", yield Promise.all(updatedJobId));
    }
    catch (e) {
        console.log(e);
    }
}));
exports.default = ApplicationStatus;
