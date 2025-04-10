"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Database_1 = require("./Databases/Database");
const user_1 = __importDefault(require("./routes/user"));
const company_1 = __importDefault(require("./routes/company"));
const JobList_1 = __importDefault(require("./Middleware/JobList"));
const jobApply_1 = __importDefault(require("./Middleware/jobApply"));
const InterviewerJobApply_1 = __importDefault(require("./Middleware/InterviewerJobApply"));
const status_1 = __importDefault(require("./Middleware/status"));
const candidateApplied_1 = __importDefault(require("./Middleware/candidateApplied"));
const profile_1 = __importDefault(require("./Middleware/profile"));
const upload_1 = __importDefault(require("./extras/upload"));
const deleteApplication_1 = __importDefault(require("./extras/deleteApplication"));
require("dotenv").config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(user_1.default);
app.use(company_1.default);
app.use(JobList_1.default);
app.use(jobApply_1.default);
app.use(InterviewerJobApply_1.default);
app.use(status_1.default);
app.use(candidateApplied_1.default);
app.use(profile_1.default);
app.use(upload_1.default);
app.use(deleteApplication_1.default);
app.listen(process.env.PORT, () => {
    console.log(`Listening on Port No. ${process.env.PORT}`);
    (0, Database_1.connectDatabase)();
});
