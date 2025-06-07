import express from 'express';
import { AuthToken } from '../Authentication/token_auth';
import { Database } from '../Databases/Database';

const candidatesList = express.Router();

const query = `SELECT "Candidate_Id" AS "id","Candidate_Name" AS "name","Job_Id","Interviewer_Name" AS "interviewer",TO_CHAR("Time", 'DD-MM-YYYY') AS "interviewDate" FROM "Interview" WHERE "Company_Id" = $1`

const GetJobRole = `SELECT "role_name" FROM "Jobs" WHERE "id" = $1`;

const SetResult = `UPDATE "Candidate_Applications" SET "FinalResult" = $1 WHERE "candidate_Id" = $2 AND "job_Id" = $3`;

candidatesList.get("/api/v1/candidatesList/",AuthToken,async(req,resp)=>{
    console.log("Request On CandidateList at Backend!!");
    console.log(req.body);
    const response = await Database.query(query,[req.user.id]);
    const PartialInformation = response.rows;
    const UpdateJobRole = PartialInformation.map(async(Info)=>{
        const Response = await Database.query(GetJobRole, [Info.Job_Id]);
        const JobRole = Response.rows[0].role_name;

        return {...Info,"jobRole":JobRole,"status": "pending","feedback":  {
            rating: 4, //THESE ARE DUMMY
            comments: 'Strong technical skills and great communication', //THESE ARE DUMMY
            strengths: ['React expertise', 'Problem-solving'], //THESE ARE DUMMY
            improvements: ['System design knowledge'], //THESE ARE DUMMY
        }};
    })
    
    const information = await Promise.all(UpdateJobRole);
    console.log(information);

    resp.status(200).json({
        message : "Everything Fine",
        information
    })
})

candidatesList.post("/api/v1/candidatesList/",AuthToken,async(req,resp)=>{
    const body = req.body;
    console.log(body);

    const value = [body.decision, body.candidateId, body.job_Id];

    try{
        await Database.query(SetResult,value);
        console.log("Result Updated Successfully ✅")
    }catch(e){
        console.log(e);
    }

})

export default candidatesList;