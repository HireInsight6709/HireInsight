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
const candidateApplied = express_1.default.Router();
const query1 = `SELECT "id", 
  json_build_object(
    'name', CONCAT("firstName", ' ', "lastName"),
    'email', "email",
    'phone', "phone"
  ) AS candidate,
  json_build_object(
    'whyHire', "whyHire",
    'experience', "experience",
    'challenge', "challenge",
    'availability', "availability",
    'salary', "salary"
  ) AS answers,
  "candidate_Id", "role", "job_Id","status", TO_CHAR("time", 'YYYY-MM-DD') as "appliedDate"
  FROM "Applications" WHERE "company_id" = $1;`;
candidateApplied.get("/api/v1/candidateApplied/", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("On candidateApplied Page");
    const companyId = req.user.id;
    try {
        const response1 = yield Database_1.Database.query(query1, [companyId]);
        const PartialObject = response1.rows;
        console.log("Partial Object is : ", PartialObject);
        const UpdatedResponse = PartialObject.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const JobValueUpdate = yield Database_1.Database.query(`SELECT "role_name" AS "jobRole" FROM "Jobs" WHERE "id" = $1`, [user.job_Id]);
            const jobDetails = JobValueUpdate.rows[0];
            delete user.job_Id;
            console.log("jobDetails is : ", jobDetails);
            return Object.assign(Object.assign({}, user), jobDetails);
        }));
        const information = yield Promise.all(UpdatedResponse);
        console.log(information);
        resp.status(200).json({
            message: "All Data fetched sucessfully",
            information: information
        });
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Internal error occured while fetching candidate applied for comapany"
        });
    }
}));
exports.default = candidateApplied;
