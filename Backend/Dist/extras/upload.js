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
const ROOT_DIR = path_1.default.resolve(__dirname, "../../");
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
                else if (role === "candidates") {
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
    }
    catch (error) {
        console.error("Upload processing error:", error);
        res.status(500).json({
            message: "Internal server error during file upload",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
exports.default = upload;
