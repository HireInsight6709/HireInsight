import express from "express";
import { Database } from "../Databases/Database";
import { AuthToken } from "../Authentication/token_auth";
import cookieParser from "cookie-parser"

const CompanyRoute = express.Router();

CompanyRoute.use(cookieParser());

const query = `INSERT INTO "Jobs" ("role_name","department","location","description","skills","experience","job_type","max_salary","min_salary","start_date","end_date","post_status","company_id") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`


CompanyRoute.post("/api/v1/dashboard/company/jobPost",AuthToken ,async(req,resp)=>{
    console.log("Job Post request recieved !!");
    const Data = req.body.data;
    console.log("Data is :",Data);
    console.log('req.user value is : ',req.user);

    const value = [Data.jobRole ,Data.department ,Data.location ,Data.description ,Data.skills ,Data.experience ,Data.jobType ,Data.salaryMax ,Data.salaryMin ,Data.startDate ,Data.endDate , 'Active',req.user.id]

    try{
        const response = await Database.query(query , value); 
        resp.status(200).json({
            message : "The job post request was sucessfull!!"
        })
        return ;
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Server was not able to compelte the request !!"
        })
        return ;
    }
})

export default CompanyRoute;