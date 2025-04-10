import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import {connectDatabase} from "./Databases/Database"

import UserRoute from "./routes/user"
import CompanyRoute from "./routes/company"
import JobList from "./Middleware/JobList"
import JobApply from "./Middleware/jobApply"
import JobApplyInterviewer from "./Middleware/InterviewerJobApply"
import ApplicationStatus from "./Middleware/status"
import candidateApplied from "./Middleware/candidateApplied"
import profile from "./Middleware/profile"
import upload from "./extras/upload"
import deleteApplication from "./extras/deleteApplication"

require("dotenv").config()

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true
    }))
app.use(express.urlencoded({ extended: true }));

app.use(UserRoute);
app.use(CompanyRoute);
app.use(JobList);
app.use(JobApply);
app.use(JobApplyInterviewer)
app.use(ApplicationStatus);
app.use(candidateApplied);
app.use(profile);
app.use(upload);
app.use(deleteApplication);

app.listen(process.env.PORT, ()=>{
    console.log(`Listening on Port No. ${process.env.PORT}`)
    connectDatabase()
})