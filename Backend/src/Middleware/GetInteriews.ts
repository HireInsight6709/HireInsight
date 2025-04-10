import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";
import {Router} from "express";


const GetInterviews = Router();

GetInterviews.get("/api/v1/GetInterviews",AuthToken,async(req,resp)=>{
    let GetInterviews = ``;

    if(req.user.role == 'Candidate'){
        GetInterviews = `SELECT 
        "id", 
            "Candidate_Id", 
            "Interview_Id", 
            "Job_Id", 
            "Meeting_Link" AS "meetingLink", 
            "Interviewer_Name" AS "InterviewerName", 
            TO_CHAR("Time", 'YYYY-MM-DD') AS "date", 
            TO_CHAR("Time", 'HH24:MI') AS "time" 
        FROM "Interview"  
        WHERE "Candidate_Id" = $1`
    }else if(req.user.role == `Interviewer`){
        GetInterviews = `SELECT 
            "id", 
            "Candidate_Id", 
            "Interview_Id", 
            "Job_Id", 
            "Meeting_Link" AS "meetingLink", 
            "Interviewer_Name" AS "InterviewerName", 
            TO_CHAR("Time", 'YYYY-MM-DD') AS "date", 
            TO_CHAR("Time", 'HH24:MI') AS "time" 
        FROM "Interview"  
        WHERE "Interview_Id" = $1`
    }

    console.log("On GetInterviews Page!!");

    try{
        const value = [req.user.id];
        const Data = await Database.query(GetInterviews,value);
        const Interviews = Data.rows;

        const updatedRoleName = Interviews.map(async(Interview)=>{
            const RoleNameFind = `SELECT "role_name" FROM "Jobs" WHERE "id" = $1`;

            const RoleDetailResponse = await Database.query(RoleNameFind,[Interview.Job_Id]);

            const Position = RoleDetailResponse.rows[0];
            console.log(Position);

            return {...Interview,position : Position.role_name, type: "Technical Interview",
                platform: "Zoom" };
        })

        const information = await Promise.all(updatedRoleName)
        console.log("Updated  are:", information);

        resp.status(200).json({
            information : information
        })
    }catch(e){
        console.log(e);

        resp.status(500).json({
            message : "Some Internal error has occured!!"
        })
    }
})

export default GetInterviews;