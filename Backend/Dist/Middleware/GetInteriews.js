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
const token_auth_1 = require("../Authentication/token_auth");
const Database_1 = require("../Databases/Database");
const express_1 = require("express");
const GetInterviews = (0, express_1.Router)();
GetInterviews.get("/api/v1/GetInterviews", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    let GetInterviews = ``;
    if (req.user.role == 'Candidate') {
        GetInterviews = `SELECT 
        "id", 
            "Candidate_Id", 
            "Interview_Id", 
            "Job_Id", 
            "Meeting_Link" AS "meetingLink", 
            "Interviewer_Name" AS "InterviewerName", 
            TO_CHAR("Time", 'YYYY-MM-DD') AS "date", 
            TO_CHAR("Time", 'HH24:MI') AS "time" 
        FROM "Interview"  
        WHERE "Candidate_Id" = $1`;
    }
    else if (req.user.role == `Interviewer`) {
        GetInterviews = `SELECT 
            "id", 
            "Candidate_Id", 
            "Interview_Id", 
            "Job_Id", 
            "Meeting_Link" AS "meetingLink", 
            "Interviewer_Name" AS "InterviewerName", 
            TO_CHAR("Time", 'YYYY-MM-DD') AS "date", 
            TO_CHAR("Time", 'HH24:MI') AS "time" 
        FROM "Interview"  
        WHERE "Interview_Id" = $1`;
    }
    console.log("On GetInterviews Page!!");
    try {
        const value = [req.user.id];
        const Data = yield Database_1.Database.query(GetInterviews, value);
        const Interviews = Data.rows;
        const updatedRoleName = Interviews.map((Interview) => __awaiter(void 0, void 0, void 0, function* () {
            const RoleNameFind = `SELECT "role_name" FROM "Jobs" WHERE "id" = $1`;
            const RoleDetailResponse = yield Database_1.Database.query(RoleNameFind, [Interview.Job_Id]);
            const Position = RoleDetailResponse.rows[0];
            console.log(Position);
            return Object.assign(Object.assign({}, Interview), { position: Position.role_name, type: "Technical Interview", platform: "Zoom" });
        }));
        const information = yield Promise.all(updatedRoleName);
        console.log("Updated  are:", information);
        resp.status(200).json({
            information: information
        });
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Some Internal error has occured!!"
        });
    }
}));
exports.default = GetInterviews;
