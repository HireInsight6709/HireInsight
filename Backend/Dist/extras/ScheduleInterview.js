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
const Database_1 = require("../Databases/Database");
const FindCandidateDetail = `
  SELECT CONCAT("firstName",' ',"lastName") AS "name"
  FROM "Candidate_Applications"
  WHERE "candidate_Id" = $1 AND "job_Id" = $2
`;
const FindInterviewerDetail = `
  SELECT CONCAT("firstName",' ',"lastName") AS "name", "interviewer_Id"
  FROM "Interviewer_Applications"
  WHERE "job_Id" = $1 AND "status" = 'Accepted'
`;
const SetInterview = `
  INSERT INTO "Interview" 
  ("Candidate_Id","Interview_Id","Job_Id","Meeting_Link","Candidate_Name","Interviewer_Name","Company_Id")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;
const DeleteCandidateApplication = `
  DELETE FROM "Candidate_Applications" 
  WHERE "candidate_Id" = $1 AND "job_Id" = $2
`;
const GetCompanyID = `
  SELECT (company_id) FROM "Jobs" 
  WHERE "id" = $1
`;
function ScheduleInterview(candidate_id, job_id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Starting interview scheduling");
        try {
            // 1. Get candidate name
            console.log("🔍 Fetching candidate details");
            const candidateRes = yield Database_1.Database.query(FindCandidateDetail, [candidate_id, job_id]);
            if (candidateRes.rows.length === 0)
                throw new Error("❌ Candidate not found");
            const candidate = candidateRes.rows[0];
            console.log("✅ Candidate found:", candidate.name);
            // 2. Get list of interviewers
            console.log("🔍 Fetching interviewer details");
            const interviewerRes = yield Database_1.Database.query(FindInterviewerDetail, [job_id]);
            if (interviewerRes.rows.length === 0) {
                console.log("❌ No interviewers found");
                try {
                    yield Database_1.Database.query(DeleteCandidateApplication, [candidate_id, job_id]);
                    console.log("🗑️ Candidate application deleted due to no available interviewers");
                }
                catch (deleteError) {
                    console.error("⚠️ Error while deleting candidate application:", deleteError);
                }
                return; // Exit early
            }
            const randomInterviewer = interviewerRes.rows[Math.floor(Math.random() * interviewerRes.rows.length)];
            console.log("✅ Interviewer selected:", randomInterviewer.name);
            // 3. Get Zoom access token
            const clientId = process.env.ZOOMCLIENTID;
            const clientSecret = process.env.ZOOMCLIENTSECRET;
            const accountId = process.env.ZOOMACCOUNTID;
            if (!clientId || !clientSecret || !accountId) {
                throw new Error("❌ Missing Zoom credentials in .env");
            }
            console.log("🔐 Getting Zoom access token");
            const base64String = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
            const tokenRes = yield fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${base64String}`
                }
            });
            if (!tokenRes.ok) {
                const errorBody = yield tokenRes.text();
                throw new Error(`❌ Zoom token error: ${tokenRes.status} - ${errorBody}`);
            }
            const tokenData = yield tokenRes.json();
            const accessToken = tokenData.access_token;
            console.log("✅ Zoom access token acquired");
            // 4. Create Zoom meeting
            const meetingPayload = {
                topic: 'Interview Session',
                type: 2,
                start_time: new Date('2024-09-30T10:30:00Z').toISOString(),
                duration: 30
            };
            console.log("📅 Creating Zoom meeting...");
            const meetingRes = yield fetch(`https://api.zoom.us/v2/users/me/meetings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetingPayload)
            });
            if (!meetingRes.ok) {
                const errorBody = yield meetingRes.text();
                throw new Error(`❌ Zoom meeting creation error: ${meetingRes.status} - ${errorBody}`);
            }
            const meetingData = yield meetingRes.json();
            const meetingLink = meetingData.join_url;
            console.log("✅ Zoom meeting created:", meetingLink);
            const Company_id = yield Database_1.Database.query(GetCompanyID, [job_id]);
            // 5. Insert into Interview table
            console.log("💾 Inserting interview into database");
            const insertValues = [
                candidate_id,
                randomInterviewer.interviewer_Id,
                job_id,
                meetingLink,
                candidate.name,
                randomInterviewer.name,
                Company_id.rows[0].company_id
            ];
            const insertRes = yield Database_1.Database.query(SetInterview, insertValues);
            console.log("✅ Interview record inserted:", insertRes.rowCount);
        }
        catch (err) {
            console.error("❗ Error in ScheduleInterview:", err.message || err);
        }
    });
}
exports.default = ScheduleInterview;
