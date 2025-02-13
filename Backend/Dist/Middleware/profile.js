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
const express_1 = __importDefault(require("express"));
const token_auth_1 = require("../Authentication/token_auth");
const Database_1 = require("../Databases/Database");
const profile = express_1.default.Router();
profile.get("/api/v1/profile", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("On Profile page");
    const query = `SELECT ("firstName","lastName","email","dateOfBirth","location","mobile","qualifications","skills","universityName") FROM "Candidate" WHERE "user_Id" = $1`;
    const value = [req.user.id];
    try {
        const response = yield Database_1.Database.query(query, value);
        console.log(response.rows);
        const information = response.rows[0].row;
        const arr = information.slice(1, -1).split(",");
        if (response.rows.length > 0) {
            resp.json({
                information: arr
            });
        }
        else {
            resp.status(404).json({
                meesage: "Data not found",
            });
        }
    }
    catch (e) {
        resp.status(500).json({
            message: "Internal error has occured"
        });
    }
}));
profile.post("/api/v1/profile", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Profile Update request Received");
    console.log(req.body.profileData);
    const profileData = req.body.profileData;
    const value = [profileData.firstName, profileData.lastName, profileData.email, profileData.dateOfBirth, profileData.location, profileData.mobileNumber, profileData.qualifications, profileData.skills, profileData.universityName, req.user.id];
    const query = `UPDATE "Candidate" SET "firstName" = $1, "lastName" = $2, email = $3, "dateOfBirth" = $4, location = $5, mobile = $6, qualifications = $7, skills = $8, "universityName" = $9 WHERE "user_Id" = $10`;
    try {
        yield Database_1.Database.query(query, value);
    }
    catch (e) {
        console.log(e);
    }
}));
profile.get("/api/v1/Companyprofile", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Yoo!! you hit the company spot 🤪");
    const query = `SELECT ("companyName","description","employeeCount","industry","location","logo","website") FROM "Company" WHERE "company_Id" = $1 `;
    try {
        const response = (yield Database_1.Database.query(query, [req.user.id])).rows[0].row;
        const arr = response.slice(1, -1).split(",");
        resp.status(200).json({
            information: arr
        });
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Internal server error has occured"
        });
    }
}));
profile.post("/api/v1/Companyprofile", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body.companyData;
    console.log(data);
    const value = [data.name, data.description, data.employeeCount, data.industry, data.location, data.logo, data.website, req.user.id];
    const query = `UPDATE "Company" SET "companyName" = $1, "description" = $2, "employeeCount" = $3, "industry" = $4, location = $5, "logo" = $6, "website" = $7 WHERE "company_Id" = $8;`;
    try {
        yield Database_1.Database.query(query, value);
        resp.status(200).json({
            message: "Data updated sucessfully!!"
        });
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Internal server error occured!!"
        });
    }
}));
exports.default = profile;
