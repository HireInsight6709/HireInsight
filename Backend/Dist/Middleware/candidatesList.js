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
const candidatesList = express_1.default.Router();
const query = `SELECT "Candidate_Id" AS "id","Candidate_Name" AS "name","Job_Id","Interviewer_Name" AS "interviewer",TO_CHAR("Time", 'DD-MM-YYYY') AS "interviewDate" FROM "Interview" WHERE "Company_Id" = $1`;
const GetJobRole = `SELECT "role_name" FROM "Jobs" WHERE "id" = $1`;
const SetResult = `UPDATE "Candidate_Applications" SET "FinalResult" = $1 WHERE "candidate_Id" = $2 AND "job_Id" = $3`;
candidatesList.get("/api/v1/candidatesList/", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request On CandidateList at Backend!!");
    console.log(req.body);
    const response = yield Database_1.Database.query(query, [req.user.id]);
    const PartialInformation = response.rows;
    const UpdateJobRole = PartialInformation.map((Info) => __awaiter(void 0, void 0, void 0, function* () {
        const Response = yield Database_1.Database.query(GetJobRole, [Info.Job_Id]);
        const JobRole = Response.rows[0].role_name;
        return Object.assign(Object.assign({}, Info), { "jobRole": JobRole, "status": "pending", "feedback": {
                rating: 4, //THESE ARE DUMMY
                comments: 'Strong technical skills and great communication', //THESE ARE DUMMY
                strengths: ['React expertise', 'Problem-solving'], //THESE ARE DUMMY
                improvements: ['System design knowledge'], //THESE ARE DUMMY
            } });
    }));
    const information = yield Promise.all(UpdateJobRole);
    console.log(information);
    resp.status(200).json({
        message: "Everything Fine",
        information
    });
}));
candidatesList.post("/api/v1/candidatesList/", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const value = [body.decision, body.candidateId, body.job_Id];
    try {
        yield Database_1.Database.query(SetResult, value);
        console.log("Result Updated Successfully ✅");
    }
    catch (e) {
        console.log(e);
    }
}));
exports.default = candidatesList;
