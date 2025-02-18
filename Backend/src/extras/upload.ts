import multer from "multer";
import express, { Request, Response, NextFunction } from "express";
import { AuthToken } from "../Authentication/token_auth";
import path from "path";
import fs from "fs";

const ROOT_DIR = path.resolve(__dirname, "../../");

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
                } else if (role === "candidates") {
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

            res.status(200).json({
                message: "File uploaded successfully",
                filename: multerReq.file.filename,
                filePath: multerReq.file.path,
                role: req.body.role
            });

        } catch (error) {
            console.error("Upload processing error:", error);
            res.status(500).json({ 
                message: "Internal server error during file upload",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
);

export default upload;