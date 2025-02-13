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
const JobApply = express_1.default.Router();
const query1 = `SELECT ("firstName","lastName",email,phone,status,time) FROM "Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2 AND "role" = $3`;
const query2 = 'INSERT INTO "Applications" ("firstName","lastName","email","phone","candidate_Id","job_Id","whyHire","experience","challenge","availability","salary","role","company_id") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)';
JobApply.post("/api/v1/jobApply", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request to jobapply");
    const formData = req.body.formData;
    const jobId = req.body.jobId;
    const role = req.user.role;
    const candidate_Id = req.user.id;
    let company_Id = null;
    const value1 = [candidate_Id, jobId, role];
    try {
        const response = yield Database_1.Database.query(query1, value1);
        const data = response.rows;
        if (response.rows.length >= 1) {
            resp.status(409).json({
                message: "Alerdy allpied form the role please check the status",
                data: data
            });
            return;
        }
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "An internal error occured"
        });
        return;
    }
    try {
        const ComapanyDetail = yield Database_1.Database.query(`SELECT "company_id" FROM "Jobs" WHERE id = $1`, [jobId]);
        console.log(ComapanyDetail.rows);
        if (ComapanyDetail.rows.length == 0) {
            resp.status(500).json({
                message: "Some internal error occured while completing the request!!"
            });
            return;
        }
        company_Id = ComapanyDetail.rows[0].company_id;
        console.log(company_Id);
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Some internal error occured while completing the request!!"
        });
    }
    const value2 = [formData.firstName, formData.lastName, formData.email, formData.phone, candidate_Id, jobId, formData.questions.whyHire, formData.questions.experience, formData.questions.challenge, formData.questions.availability, formData.questions.salary, role, company_Id];
    try {
        yield Database_1.Database.query(query2, value2);
        resp.status(200).json({
            message: "The Registration for Job was successfull"
        });
        return;
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "An internal error occured"
        });
        return;
    }
}));
exports.default = JobApply;
