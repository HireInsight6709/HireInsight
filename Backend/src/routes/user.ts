import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Database } from "../Databases/Database";

const UserRoute = express.Router();
require("dotenv").config();

type UserObject = {
    name: string;
    email: string;
    jobposts: any[];
};

type PayLoad = {
    name : string,
    email : string,
    id: number,
    role: string
}

type FormData = {
    password : string;
}

const query1 = `INSERT INTO "Candidate" ("user_Id", "firstName", "lastName", mobile, email, password,"salt") VALUES ($1,$2,$3,$4,$5,$6,$7)`

const query2 = `INSERT INTO "Interviewer" ("user_Id", "firstName", "lastName", mobile, email, password,"salt") VALUES ($1,$2,$3,$4,$5,$6,$7)`

const query3 = `INSERT INTO "Company" ("company_Id", "companyName",mobile, email, password,"salt") VALUES ($1,$2,$3,$4,$5,$6)`

const query4 = `SELECT ("firstName",email,password,"salt","user_Id") from "Candidate" WHERE email = $1`

const query5 = `SELECT ("firstName",email,password,"salt","user_Id") from "Interviewer" WHERE email = $1`

const query6 = `SELECT ("companyName",email,password,"salt","company_Id") from "Company" WHERE email = $1`

function genratePassword(FormData : FormData){
    const salt = bcrypt.genSaltSync(10);
    const HashedPassword = bcrypt.hashSync(FormData.password,salt)
    
    return {HashedPassword,salt}
}

function signToken(obj : PayLoad){
    const key = `${process.env.TOKENKEY}`;
    return jwt.sign(obj , key)
}

async function generatePayload(query:string,value:[string],role:string){
    const response = await Database.query(query,value);
        if(response.rows.length === 0){
            throw new Error("User not found during payload generation.");
        }
        const Data = response.rows[0].row;
        console.log(Data)
        const stripedString = Data.slice(1,-1);
        const NewData = stripedString.split(",");
        
        console.log("NewData is : ",NewData);

        const payload: PayLoad = {
            name: NewData[0],
            email: NewData[1],
            id: NewData[4],
            role: role
        };
        return payload; 
}

UserRoute.post('/api/v1/register/candidate',async(req,resp)=>{
    console.log("Request on Candidate Register")
    // console.log(req.body.formData)
    const FormData = req.body.formData;

    const CheckExistance = await Database.query(query4,[FormData.email]);
    console.log(CheckExistance.rows);
    if(CheckExistance.rows.length > 0){
        resp.status(409).json({
            message : "User with simailry email alredy exists"
        })
        return;
    }

    const {HashedPassword,salt} = genratePassword(FormData);
    
    const value = [FormData.userId,FormData.firstName,FormData.lastName,FormData.mobile,FormData.email,HashedPassword,salt]

    try{
        await Database.query(query1,value);

        const payload: PayLoad = await generatePayload(query4,[FormData.email],"Candidate");
        resp.status(200).json({
            message : "Registration sucessfull.",
            token : signToken(payload)
        })
        return ;
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Server Failed to complete the request!!",
            error : e
        })
    }
})

UserRoute.post('/api/v1/register/interviewer',async(req,resp)=>{
    console.log("Request on Interviewer Register")
    // console.log(req.body.formData)
    const FormData = req.body.formData;

    const CheckExistance = await Database.query(query5,[FormData.email]);
    console.log(CheckExistance.rows);

    if(CheckExistance.rows.length > 0){
        resp.status(409).json({
            message : "User with simailry email alredy exists"
        })
        return;
    }
    const {HashedPassword,salt} = genratePassword(FormData);
    
    const value = [FormData.userId,FormData.firstName,FormData.lastName,FormData.mobile,FormData.email,HashedPassword,salt]

    try{
        await Database.query(query2,value);
        
        const payload: PayLoad = await generatePayload(query5,[FormData.email],"Interviewer") 
        resp.status(200).json({
            message : "Registration sucessfull.",
            token : signToken(payload)
        })
        return ;
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Server Failed to complete the request!!",
            error : e
        })
    }
})

UserRoute.post('/api/v1/register/company',async(req,resp)=>{
    console.log("Request on Company Register")
    console.log(req.body.formData)

    const FormData = req.body.formData;

    const CheckExistance = await Database.query(query6,[FormData.email]);
    console.log(CheckExistance.rows);
    if(CheckExistance.rows.length > 0){
        resp.status(409).json({
            message : "User with simailry email alredy exists"
        })
        return;
    }

    const {HashedPassword,salt} = genratePassword(FormData);
    
    const value = [FormData.companyId,FormData.companyName,FormData.mobile,FormData.email,HashedPassword,salt]

    try{
        await Database.query(query3,value);

        const payload: PayLoad = await generatePayload(query6,[FormData.email],"Comopany") 

        resp.status(200).json({
            message : "Registration sucessfull.",
            token : signToken(payload)
        })
    }catch(e){
        console.log(e)
        resp.status(500).json({
            message : "Server Failed to complete the request!!",
            error : e
        })
    }
})

UserRoute.post('/api/v1/auth/candidate',async(req,resp)=>{
    console.log("Request on Candidate auth")

    const formData = req.body.formData;
    console.log("User's Data is : ",formData);
    
    const value = [req.body.formData.email];
    
    try{
        const response = await Database.query(query4 , value);
        
        if(response.rows.length > 0 )
        {
            const Data = response.rows[0].row;
            
            const stripedString = Data.slice(1,-1);
            const NewData = stripedString.split(",");

            const obj : UserObject = {
                name : NewData[0],
                email : NewData[1],
                jobposts : []
            };

            
            console.log("object is : ",obj)

            const CompareValue = bcrypt.compareSync(formData.password , NewData[2]);
            const role = "Candidate";

            if(formData.email == obj.email && CompareValue){
                const payload: PayLoad = {
                    name: obj.name,
                    email: obj.email,
                    id : NewData[4],
                    role : role
                };
        
                resp.status(200).json({
                    message : "Data was found and fetched successfully!!",
                    token : signToken(payload)
                })
                return ;
            }else{
                resp.status(401).json({
                    message : "Invalid Details Found!! Try chaning details"
                })
                return ;
            }
            
        }else {
            resp.status(404).json({
                message : "Data not Found make sure you entered details correct or the user is registered!!"
            })
            return;
        }
    }catch(e){
        console.log(e)
        return;
    }
})

UserRoute.post('/api/v1/auth/interviewer',async(req,resp)=>{
    console.log("Request on Interviewer auth")

    const formData = req.body.formData;
    console.log("User's Data is : ",formData);
    
    const value = [req.body.formData.email];
    
    try{
        const response = await Database.query(query5 , value);
        
        if(response.rows.length > 0 )
        {
            const Data = response.rows[0].row;
            
            const stripedString = Data.slice(1,-1);
            const NewData = stripedString.split(",");
            const role = "Interviewer";

            const obj : UserObject = {
                name : NewData[0],
                email : NewData[1],
                jobposts : []
            };
            
            console.log("object is : ",obj)
            
            const CompareValue = bcrypt.compareSync(formData.password , NewData[2]);

            if(formData.email == obj.email && CompareValue){
                const payload: PayLoad = {
                    name: obj.name,
                    email: obj.email,
                    id : NewData[4],
                    role: role
                };
        
                resp.status(200).json({
                    message : "Data was found and fetched successfully!!",
                    token : signToken(payload)
                })
                return ;
            }else{
                resp.status(401).json({
                    message : "Invalid Details Found!! Try chaning details"
                })
                return ;
            }
            
        }else {
            resp.status(404).json({
                message : "Data not Found make sure you entered details correct or the user is registered!!"
            })
            return ;
        }
    }catch(e){
        console.log(e)
        return ;
    }
})

UserRoute.post('/api/v1/auth/company',async(req,resp)=>{    
    console.log("Request on Company auth")
    
    const formData = req.body.formData;
    console.log("User's Data is : ",formData);
    
    const value = [req.body.formData.email];

    try{
        const response = await Database.query(query6 , value);
        
        if(response.rows.length > 0 )
        {
            const Data = response.rows[0].row;
            
            const stripedString = Data.slice(1,-1);
            const NewData = stripedString.split(",");

            const obj : UserObject = {
                name : NewData[0],
                email : NewData[1],
                jobposts : []
            };
            
            console.log("object is : ",obj)
            
            const CompareValue = bcrypt.compareSync(formData.password,NewData[2]);
            const role = "Company";

            if(formData.email == obj.email && CompareValue){
                const payload: PayLoad = {
                    name: obj.name,
                    email: obj.email,
                    id : NewData[4],
                    role : role
                };
        
                resp.status(200).json({
                    message : "Data was found and fetched successfully!!",
                    token : signToken(payload)
                })
                return ;
            }else{
                resp.status(401).json({
                    message : "Invalid Details Found!! Try chaning details"
                })
                return ;
            }
            
        }else {
            resp.status(404).json({
                message : "Data not Found make sure you entered details correct or the user is registered!!"
            })
            return ;
        }
    }catch(e){
        console.log(e)
        return ;
    }
})

export default UserRoute;