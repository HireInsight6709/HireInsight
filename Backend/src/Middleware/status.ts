import express from "express"
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

const ApplicationStatus = express.Router();

const query1 = `SELECT ("job_Id") FROM "Applications" WHERE "candidate_Id" = $1 AND "role" = $2`;

ApplicationStatus.get("/api/v1/status",AuthToken,async(req,resp)=>{
    console.log("On status Page")
    try{
        const response = await Database.query(query1,[req.user.id,req.user.role])
        const jobs = response.rows;

        const updatedJobId = jobs.map(async (job) => {
                console.log(job);
                const jobDetailResponse = await Database.query(
                    `SELECT "role_name", "company_id" FROM "Jobs" WHERE "id" = $1`,
                    [job.job_Id]
                );
                const jobDetail = jobDetailResponse.rows[0];
                console.log(jobDetail);

                const comapnyDetailResponse = await Database.query(`SELECT "companyName" FROM "Company" WHERE "company_Id" = $1`,[jobDetail.company_id]);

                const comapnyDetail = comapnyDetailResponse.rows[0];

        
                // Replace the `id` with the fetched job detail
                return {...jobDetail,...comapnyDetail} ;
            })
        
        console.log("Updated jobs are:", await Promise.all(updatedJobId));
    }catch(e){
        console.log(e);
    }
})

export default ApplicationStatus;