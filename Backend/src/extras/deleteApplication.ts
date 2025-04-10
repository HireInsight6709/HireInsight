import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";
import express from "express";

const deleteApplication = express.Router();

deleteApplication.post("/api/v1/deleteApplication",AuthToken,async(req,resp)=>{
    let query = ''
    
    if(req.body.role == 'Candidate'){
        query = `DELETE FROM "Candidate_Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`
    }else{
        query = `DELETE FROM "Interviewer_Applications" WHERE "interviewer_Id" = $1 AND "job_Id" = $2`
    }
    
    try{
        await Database.query(query,[req.user.id,req.body.jobId]);
    }catch(e){
        console.log(e);
        resp.status(500).json({
            message : "Some server error occured!"
        })
    }
})

export default deleteApplication;