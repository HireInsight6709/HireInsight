import express from "express"
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

const ApplicationStatus = express.Router();


ApplicationStatus.get("/api/v1/status",AuthToken,async(req,resp)=>{
    
    let query1 = "";
    
    if(req.user.role == 'Candidate'){
        query1 = `SELECT "id","job_Id","status" AS "ApplicationStatus","FinalResult" AS "status" FROM "Candidate_Applications" WHERE "candidate_Id" = $1 AND "role" = $2`
    }else if (req.user.role == "Interviewer"){
      query1 = `SELECT "id","job_Id","status" AS "ApplicationStatus" FROM "Interviewer_Applications" WHERE "candidate_Id" = $1 AND "role" = $2`
    }

    console.log("On Candidate Application's status Page")
    try{
        const response = await Database.query(query1,[req.user.id,req.user.role])
        const jobs = response.rows;

        const updatedJobId = jobs.map(async (job) => {
                console.log(job);
                const jobDetailResponse = await Database.query(
                    `SELECT "role_name" AS "jobRole", "company_id" FROM "Jobs" WHERE "id" = $1`,
                    [job.job_Id]
                );
                const jobDetail = jobDetailResponse.rows[0];
                console.log(jobDetail);

                const comapnyDetailResponse = await Database.query(`SELECT "companyName" FROM "Company" WHERE "company_Id" = $1`,[jobDetail.company_id]);

                const comapnyDetail = comapnyDetailResponse.rows[0];

        
                // Replace the `id` with the fetched job detail
    //   "status": "Rejected",
    //   "feedback": "Feedback here


                return {...job,...jobDetail,...comapnyDetail, interviewer: "" ,interviewDate: "" , feedback: "Feedback Here"} ;
            })
        const information = await Promise.all(updatedJobId)
        console.log("Updated jobs are:", information);

        resp.status(200).json({
            information : information
        })
    }catch(e){
        console.log(e);
        
        resp.status(500).json({
            message: "Internal server error"
        })
    }
})

export default ApplicationStatus;