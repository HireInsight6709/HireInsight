import express from "express";
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

const JobList = express.Router();

const query1 = `
  SELECT 
    c."company_Id" AS "id",
    c."companyName" AS "name",
    JSON_BUILD_OBJECT(
      'id', c."companyName", -- Correctly references the column
      'logo', 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'description', 'Default company description',
      'jobs', COALESCE(
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'name', c."companyName", -- Use double quotes for column names
              'id', j.id,
              'title', j.role_name,
              'location', j.location,
              'type', j.job_type,
              'salary', CONCAT('$', j.min_salary, ' - $', j.max_salary),
              'posted', j.time::DATE,
              'experience', j.experience,
              'description', j.description,
              'requirements', j.skills
            )
          )
          FROM public."Jobs" j
          WHERE j.company_id = c."company_Id"
        ), '[]'::JSON
      )
    ) AS company_info
  FROM public."Company" c;
`;

const query2 = `SELECT * FROM "Jobs" WHERE company_id = $1 AND post_status = 'Active'`;

JobList.get("/api/v1/dashboard/", AuthToken, async(req,resp)=>{
    console.log("On Interviewer and Candidate JobList Page");

    try{
        const response = await Database.query(query1);
        // console.log(response.rows);

        const data = await response.rows[0].company_info.jobs;
        // console.log(data)

        resp.status(200).json({
            message : "Data fetched!!",
            companies : response.rows
        })
    }catch(e){
        console.log(e)
        resp.status(404).json({
            message : "An internal error occured while fetching data from server!!"
        })
    }
})

JobList.get("/api/v1/Companydashboard/", AuthToken, async(req,resp)=>{
    // console.log("On Company JobList Page");
    // console.log("Value of req.user is : ",req.user);
    try{
        const response = await Database.query(query2 , [req.user.id]);
        // console.log(response.rows);

        resp.status(200).json({
            message : "Data fetched!!",
            jobs : response
        })
    }catch(e){
        resp.status(404).json({
            message : "An internal error occured while fetching data from server!!"
        })
    }
})

export default JobList;