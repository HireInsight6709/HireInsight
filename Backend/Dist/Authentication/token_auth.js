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
exports.AuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function AuthToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("Raw Headers (cookie):", req.headers.cookie);
        // console.log("Parsed Cookies:", req.cookies);
        const token = yield req.cookies.token; // Reading the cookie named "token"
        // console.log(token)
        if (!token) {
            // Instead of returning the response directly here, use next()
            res.status(403).json({ message: "No token provided" });
            return;
        }
        try {
            const secretKey = `${process.env.TOKENKEY}`;
            const decoded = jsonwebtoken_1.default.verify(token, secretKey);
            req.user = decoded; // Attach the decoded token to req.user
            console.log("decoded data is : ", decoded);
            next(); // Proceed to the next middleware
        }
        catch (err) {
            console.error(err);
            // Return the error response only when needed
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
    });
}
exports.AuthToken = AuthToken;
