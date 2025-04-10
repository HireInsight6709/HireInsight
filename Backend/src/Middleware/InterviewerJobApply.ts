import express from "express";
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

interface FormDataInterface {
    firstName : string,
    lastName : string,
    email : string,
    phone : string,
    id : number,
    questions : {
        whyHire : string,
        experience : string,
        challenge : string,
        availability : string,
        salary : string
    }
}

const JobApplyInterviewer = express.Router();

const query1 = `SELECT ("firstName","lastName",email,phone,status,time) FROM "Interviewer_Applications" WHERE "interviewer_Id" = $1 AND "job_Id" = $2 AND "role" = $3`;

const query2 = 'INSERT INTO "Interviewer_Applications" ("firstName","lastName","email","phone","interviewer_Id","job_Id","whyHire","experience","challenge","availability","salary","role","company_Id") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)';

JobApplyInterviewer.post("/api/v1/InterviewerJobApply",AuthToken,async(req,resp)=>{
    console.log("Request to  Interviewer jobapply");
    const formData : FormDataInterface = req.body.formData;
    const jobId = req.body.jobId;
    const role = req.user.role;
    const Id = req.user.id;
    let company_Id = null;

    const value1 = [Id , jobId , role];

    try{
        const response  = await Database.query(query1,value1);
        const data = response.rows;
        if(response.rows.length >= 1){
            resp.status(409).json({
                message : "Alerdy allpied form the role please check the status",
                data : data
            })
            return ;
        }
    }catch(e){
        console.log(e)

        resp.status(500).json({
            message : "An internal error occured"
        })
        return;
    }

    try{
        const ComapanyDetail = await Database.query(`SELECT "company_id" FROM "Jobs" WHERE id = $1`,[jobId]);
        console.log(ComapanyDetail.rows);
        if(ComapanyDetail.rows.length == 0){
            resp.status(500).json({
                message : "Some internal error occured while completing the request!!"
            })
            return;
        }
        company_Id = ComapanyDetail.rows[0].company_id;
        console.log(company_Id);
        
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Some internal error occured while completing the request!!"
        })
    }

    const value2 = [formData.firstName , formData.lastName , formData.email , formData.phone , Id , jobId , formData.questions.whyHire , formData.questions.experience , formData.questions.challenge , formData.questions.availability , formData.questions.salary , role , company_Id ];

    try{
        await Database.query(query2,value2);

        resp.status(200).json({
            message : "The Registration for Job was successfull"
        })
        return ;
    }
    catch(e){
        console.log(e);

        resp.status(500).json({
            message : "An internal error occured"
        })
        return ;
    }
})

export default JobApplyInterviewer;