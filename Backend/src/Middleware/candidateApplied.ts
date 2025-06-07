import express from "express";
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

const candidateApplied = express.Router();

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
  FROM "Candidate_Applications" WHERE "company_Id" = $1;`

candidateApplied.get("/api/v1/candidateApplied/",AuthToken,async(req,resp)=>{
  console.log("On candidateApplied Page");

  const companyId = req.user.id;

  try{
    const response1 = await Database.query(query1,[companyId]);
    const PartialObject = response1.rows;
    console.log("Partial Object is : ",PartialObject);
    
    const UpdatedResponse = PartialObject.map(async(user)=>{
      const JobValueUpdate = await Database.query(`SELECT "role_name" AS "jobRole" FROM "Jobs" WHERE "id" = $1`,[user.job_Id]);
      const jobDetails = JobValueUpdate.rows[0];
      delete user.job_Id;
      console.log("jobDetails is : ",jobDetails);

      return {...user,...jobDetails}
    })

    const information = await Promise.all(UpdatedResponse);
    console.log(information);

    resp.status(200).json({
      message : "All Data fetched sucessfully",
      information : information
    })

  }catch(e){
    console.log(e)
    resp.status(500).json({
      message : "Internal error occured while fetching candidate applied for comapany"
    })
  }
})


export default candidateApplied;