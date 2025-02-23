import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";
import express from "express";

const deleteApplication = express.Router();
const query = `DELETE FROM "Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`

deleteApplication.post("/api/v1/deleteApplication",AuthToken,async(req,resp)=>{
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