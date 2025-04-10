"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const token_auth_1 = require("../Authentication/token_auth");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const Database_1 = require("../Databases/Database");
const SendMail_1 = __importDefault(require("./SendMail"));
const deleteApplication_1 = __importDefault(require("./deleteApplication"));
const ScheduleInterview_1 = __importDefault(require("./ScheduleInterview"));
const ROOT_DIR = path_1.default.resolve(__dirname, "../../");
const pythonScriptPath = path_1.default.join(__dirname, '../../../ResumeScreening/ResumeScreening3.py');
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

Demonstrating a strong understanding of cloud platforms, particularly GCP, for deploying AI applications.`;
// pass jd as 2nd arg
const runPythonScript = (pdfPath, job_description) => {
    return new Promise((resolve, reject) => {
        // pass jd as 3rd arg
        const process = (0, child_process_1.spawn)('python', [pythonScriptPath, pdfPath, job_description]);
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
            }
            catch (err) {
                reject(new Error(`Error parsing Python output: ${err.message}`));
                console.log("Due to parse error application deleted!!");
                deleteApplication_1.default;
            }
        });
    });
};
const generateFilename = (originalName) => {
    const ext = path_1.default.extname(originalName);
    const name = path_1.default.basename(originalName, ext).replace(/\s+/g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${name}_${timestamp}${ext}`;
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = "uploads/";
        const role = req.user.role.toLowerCase();
        console.log("Processing role:", role);
        if (role && file.mimetype) {
            if (file.mimetype.includes("pdf") || file.mimetype.includes("msword") || file.mimetype.includes("officedocument")) {
                if (role === "interviewer") {
                    folder = "uploads/interviewers";
                }
                else if (role === "candidate") {
                    folder = "uploads/candidates";
                }
                else if (role === "company") {
                    folder = "uploads/job_descriptions";
                }
                else {
                    folder = "uploads/others";
                }
            }
            else {
                console.log("Unsupported file type:", file.mimetype);
            }
        }
        const folderPath = path_1.default.join(ROOT_DIR, folder);
        fs_1.default.mkdirSync(folderPath, { recursive: true });
        console.log("Uploading to:", folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        var _a;
        const role = (_a = req.body.role) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const filename = generateFilename(file.originalname);
        const finalFilename = role ? `${role}_${filename}` : filename;
        console.log("Generated filename:", finalFilename);
        cb(null, finalFilename);
    }
});
const uploadMiddleware = (0, multer_1.default)({ storage });
const upload = express_1.default.Router();
upload.post("/api/v1/upload", token_auth_1.AuthToken, (req, res, next) => {
    console.log("Starting file upload process");
    uploadMiddleware.single('file')(req, res, (err) => {
        if (err) {
            console.error("Multer upload error:", err);
            deleteApplication_1.default;
            return res.status(400).json({
                message: "File upload error",
                error: err.message
            });
        }
        next();
    });
}, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Processing uploaded file");
        console.log("Request body:", req.body);
        const multerReq = req;
        if (!multerReq.file) {
            res.status(400).json({ message: "No file uploaded" });
            console.log("Due to multer file error application deleted!!");
            deleteApplication_1.default;
            return;
        }
        const role = req.user.role;
        if (!role) {
            res.status(400).json({ message: "Role is required" });
            console.log("Due to role error in uplaods the application deleted!!");
            deleteApplication_1.default;
            return;
        }
        // pass jd as 2nd arg
        const result = yield runPythonScript(multerReq.file.path, job_description);
        console.log("Python script result:", result.response);
        // Check them and fix them
        const candidate_id = req.user.id;
        const job_id = req.body.JobId;
        const regex1 = /Overall Rating \(out of 10\): \[(\d+)\]/;
        const regex2 = /Overall Rating \(out of 10\):\s*(\d+)/;
        let overallRatingMatch = result.response.match(regex1);
        if (!overallRatingMatch) {
            overallRatingMatch = result.response.match(regex2);
        }
        console.log("The Overall Rating was : ", overallRatingMatch);
        let decision = '';
        if (overallRatingMatch) {
            const overallRating = parseInt(overallRatingMatch[1], 10);
            decision = overallRating >= 0 ? 'Accepted' : 'Rejected'; // Changed threshold to 5
        }
        let query = "";
        if (role == 'Candidate') {
            query = `UPDATE "Candidate_Applications" SET status = $1,"ResumeAnalysis_Feedback"=$2 WHERE "candidate_Id" = $3 AND "job_Id" = $4`;
        }
        else if (role == "Interviewer") {
            query = `UPDATE "Interviewer_Applications" SET status = $1,"ResumeAnalysis_Feedback"=$2 WHERE "interviewer_Id" = $3 AND "job_Id" = $4`;
        }
        const value = [decision, result.response, candidate_id, job_id];
        yield Database_1.Database.query(query, value);
        yield (0, SendMail_1.default)(decision, candidate_id, job_id, role);
        if (decision === 'Accepted') {
            yield (0, ScheduleInterview_1.default)(candidate_id, job_id);
        }
        res.status(200).json({
            message: "Server Task successfully",
            filename: multerReq.file.filename,
            filePath: multerReq.file.path,
            role: role
        });
    }
    catch (error) {
        console.error("Upload processing error:", error);
        const candidate_id = req.user.id;
        const job_id = req.body.JobId;
        let query = '';
        if (req.body.role == 'Candidate') {
            query = `DELETE FROM "Candidate_Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`;
        }
        else {
            query = `DELETE FROM "Interviewer_Applications" WHERE "interviewer_Id" = $1 AND "job_Id" = $2`;
        }
        const value = [candidate_id, job_id];
        yield Database_1.Database.query(query, value);
        res.status(500).json({
            message: "Internal server error during file upload",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
exports.default = upload;
