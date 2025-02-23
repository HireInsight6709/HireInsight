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
const token_auth_1 = require("../Authentication/token_auth");
const Database_1 = require("../Databases/Database");
const express_1 = __importDefault(require("express"));
const deleteApplication = express_1.default.Router();
const query = `DELETE FROM "Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`;
deleteApplication.post("/api/v1/deleteApplication", token_auth_1.AuthToken, (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Database_1.Database.query(query, [req.user.id, req.body.jobId]);
    }
    catch (e) {
        console.log(e);
        resp.status(500).json({
            message: "Some server error occured!"
        });
    }
}));
exports.default = deleteApplication;
