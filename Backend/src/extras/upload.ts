import multer from "multer";
import express, { Request, Response, NextFunction } from "express";
import { AuthToken } from "../Authentication/token_auth";
import path from "path";
import fs from "fs";
import { spawn } from 'child_process';
import { Database } from "../Databases/Database";
import SendMail from "./SendMail";


const ROOT_DIR = path.resolve(__dirname, "../../");
const pythonScriptPath = path.join(__dirname, '../../../ResumeScreening/ResumeScreening3.py');
const job_description = `    Hi, We are looking for Candidates who are having experience as Gen AI Role.



Experience Required: 5+ years.

Location: PAN India

Responsibilities:

Design, develop, and deploy generative AI models

Leveraging your expertise in Generative AI, Python, Machine Learning, Data Science, and Statistics to develop cutting-edge solutions for our clients.

Utilizing NLP techniques, LangChain, and LLM's to develop conversational chatbots and language models tailored to our clients' needs.

Collaborating with cross-functional teams to design and implement advanced AI models and algorithms.

Providing technical expertise and thought leadership in the field of Generative AI and NLP to guide clients in adopting AI-driven solutions.

Conducting data analysis, preprocessing, and modeling to extract valuable insights and drive data-driven decision-making.

Staying up to date with the latest advancements in AI technologies, frameworks, and tools, and proactively learning and adopting new technologies to enhance our offerings.

Demonstrating a strong understanding of cloud platforms, particularly GCP, for deploying AI applications.`

// pass jd as 2nd arg
const runPythonScript = (pdfPath: string , job_description : string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // pass jd as 3rd arg
      const process = spawn('python', [pythonScriptPath, pdfPath, job_description]);
  
      let dataString = '';
      let errorString = '';
  
      process.stdout.on('data', (data) => {
        dataString += data.toString();
      });
  
      process.stderr.on('data', (data) => {
        errorString += data.toString();
      });
  
      process.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python script exited with code ${code}: ${errorString}`));
        }
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (err) {
          reject(new Error(`Error parsing Python output: ${(err as Error).message}`));
        }
      });
    });
  };
  

const generateFilename = (originalName: string) => {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext).replace(/\s+/g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${name}_${timestamp}${ext}`;
};

interface MulterRequest extends Request {
    file: Express.Multer.File;
}

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        let folder = "uploads/";
        
        const role = req.user.role.toLowerCase();
        console.log("Processing role:", role);

        if (role && file.mimetype) {
            if (file.mimetype.includes("pdf") || file.mimetype.includes("msword") || file.mimetype.includes("officedocument")) {
                if (role === "interviewer") {
                    folder = "uploads/interviewers";
                } else if (role === "candidate") {
                    folder = "uploads/candidates";
                } else if (role === "company") {
                    folder = "uploads/job_descriptions";
                } else {
                    folder = "uploads/others";
                }
            } else {
                console.log("Unsupported file type:", file.mimetype);
            }
        }

        const folderPath = path.join(ROOT_DIR, folder);
        fs.mkdirSync(folderPath, { recursive: true });
        console.log("Uploading to:", folderPath);
        cb(null, folderPath);
    },
    filename: (req: Request, file, cb) => {
        const role = req.body.role?.toLowerCase();
        const filename = generateFilename(file.originalname);
        const finalFilename = role ? `${role}_${filename}` : filename;
        console.log("Generated filename:", finalFilename);
        cb(null, finalFilename);
    }
});

const uploadMiddleware = multer({ storage });

const upload = express.Router();

upload.post(
    "/api/v1/upload",
    AuthToken,
    (req: Request, res: Response, next: NextFunction) => {
        console.log("Starting file upload process");
        uploadMiddleware.single('file')(req, res, (err) => {
            if (err) {
                console.error("Multer upload error:", err);
                return res.status(400).json({ 
                    message: "File upload error", 
                    error: err.message 
                });
            }
            next();
        });
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log("Processing uploaded file");
            console.log("Request body:", req.body);

            const multerReq = req as MulterRequest;

            if (!multerReq.file) {
                res.status(400).json({ message: "No file uploaded" });
                return;
            }

            if (!req.body.role) {
                res.status(400).json({ message: "Role is required" });
                return;
            }
            // pAss jd as 2nd arg
            const result = await runPythonScript(multerReq.file.path,job_description);
            console.log("Python script result:", result.response);

            // Check them and fix them
            const  candidate_id = req.user.id;
            const job_id = req.body.JobId;

            const overallRatingMatch = result.response.match(/Overall Rating \(out of 10\):\s*(\d+)/);
            
            let decision = '';

            if (overallRatingMatch) {
            const overallRating = parseInt(overallRatingMatch[1], 10);
            decision = overallRating >= 6 ? 'Accepted' : 'Rejected';
            }
            
            const query = `UPDATE "Applications" SET status = $1,"ResumeAnalysis_Feedback"=$2 WHERE "candidate_Id" = $3 AND "job_Id" = $4`

            const value = [decision,result.response,candidate_id,job_id];

            await Database.query(query,value);

            await SendMail(decision,candidate_id,job_id);

            res.status(200).json({
                message: "Server Task successfully",
                filename: multerReq.file.filename,
                filePath: multerReq.file.path,
                role: req.body.role
            });

        }catch(error) {
            console.error("Upload processing error:", error);

            const  candidate_id = req.user.id;
            const job_id = req.body.JobId;

            const query = `DELETE FROM "Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`

            const value = [candidate_id,job_id]

            await Database.query(query,value);

            res.status(500).json({ 
                message: "Internal server error during file upload",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
);

export default upload;