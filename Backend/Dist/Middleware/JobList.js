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
const JobList = express_1.default.Router();
const query1 = `
  SELECT 
    c."company_Id" AS "id",
    c."companyName" AS "name",
    JSON_BUILD_OBJECT(
      'id', c."companyName", -- Correctly references the column
      'logo', 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'description', 'Default company description',
      'jobs', COALESCE(
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'name', c."companyName", -- Use double quotes for column names
              'id', j.id,
              'title', j.role_name,
              'location', j.location,
              'type', j.job_type,
              'salary', CONCAT('$', j.min_salary, ' - $', j.max_salary),
              'posted', j.time::DATE,
              'experience', j.experience,
              'description', j.description,
              'requirements', j.skills
            )
          )
          FROM public."Jobs" j
          WHERE j.company_id = c."company_Id"
        ), '[]'::JSON
      )
    ) AS company_info
  FROM public."Company" c;
`;
const query2 = `SELECT * FROM "Jobs" WHERE company_id = $1 AND post_status = 'Active'`;
JobList.get("/api/v1/dashboard/", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("On Interviewer and Candidate JobList Page");
    try {
        const response = yield Database_1.Database.query(query1);
        // console.log(response.rows);
        const data = yield response.rows[0].company_info.jobs;
        // console.log(data)
        resp.status(200).json({
            message: "Data fetched!!",
            companies: response.rows
        });
    }
    catch (e) {
        console.log(e);
        resp.status(404).json({
            message: "An internal error occured while fetching data from server!!"
        });
    }
}));
JobList.get("/api/v1/Companydashboard/", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("On Company JobList Page");
    // console.log("Value of req.user is : ",req.user);
    try {
        const response = yield Database_1.Database.query(query2, [req.user.id]);
        // console.log(response.rows);
        resp.status(200).json({
            message: "Data fetched!!",
            jobs: response
        });
    }
    catch (e) {
        resp.status(404).json({
            message: "An internal error occured while fetching data from server!!"
        });
    }
}));
exports.default = JobList;
