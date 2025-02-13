import express, { query } from "express"
import { AuthToken } from "../Authentication/token_auth";
import { Database } from "../Databases/Database";

const profile = express.Router();

profile.get("/api/v1/profile",AuthToken,async(req,resp)=>{
    console.log("On Profile page");

    const query = `SELECT ("firstName","lastName","email","dateOfBirth","location","mobile","qualifications","skills","universityName") FROM "Candidate" WHERE "user_Id" = $1`;

    const value = [req.user.id];
    try{
        const response = await Database.query(query , value);
        console.log(response.rows);

        const information = response.rows[0].row;
        const arr = information.slice(1, -1).split(",");
    
        if(response.rows.length > 0){
            resp.json({
                information : arr
            })
        }else{
            resp.status(404).json({
                meesage : "Data not found",
            })
        }
    }catch(e){
        resp.status(500).json({
            message : "Internal error has occured"
        })
    }
    
});

profile.post("/api/v1/profile",AuthToken,async(req,resp)=>{
    console.log("Profile Update request Received");
    console.log(req.body.profileData);
    const profileData = req.body.profileData;

    const value = [profileData.firstName,profileData.lastName,profileData.email,profileData.dateOfBirth,profileData.location,profileData.mobileNumber,profileData.qualifications,profileData.skills,profileData.universityName, req.user.id];

    const query = `UPDATE "Candidate" SET "firstName" = $1, "lastName" = $2, email = $3, "dateOfBirth" = $4, location = $5, mobile = $6, qualifications = $7, skills = $8, "universityName" = $9 WHERE "user_Id" = $10`;

    try{
        await Database.query(query,value);
    }catch(e){
        console.log(e);
    }

})

profile.get("/api/v1/Companyprofile",AuthToken,async(req,resp)=>{
    console.log("Yoo!! you hit the company spot 🤪");
    const query = `SELECT ("companyName","description","employeeCount","industry","location","logo","website") FROM "Company" WHERE "company_Id" = $1 `

    try{
        const response = (await Database.query(query , [req.user.id])).rows[0].row;
        const arr = response.slice(1, -1).split(",");
        
        resp.status(200).json({
            information : arr
        })
    }catch(e){
        console.log(e);
        resp.status(500).json({
            message : "Internal server error has occured"
        })
    }

})

profile.post("/api/v1/Companyprofile",AuthToken,async(req,resp)=>{
    const data = req.body.companyData;
    console.log(data);
    const value = [data.name , data.description , data.employeeCount , data.industry , data.location , data.logo , data.website , req.user.id];

    const query = `UPDATE "Company" SET "companyName" = $1, "description" = $2, "employeeCount" = $3, "industry" = $4, location = $5, "logo" = $6, "website" = $7 WHERE "company_Id" = $8;`

    try{
        await Database.query(query,value);

        resp.status(200).json({
            message : "Data updated sucessfully!!"
        })
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Internal server error occured!!"
        })
    }
})

export default profile;