import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function AuthToken(req: Request, res: Response, next: NextFunction){
    // console.log("Raw Headers (cookie):", req.headers.cookie);
    // console.log("Parsed Cookies:", req.cookies);

    const token = await req.cookies.token; // Reading the cookie named "token"
    // console.log(token)

    if (!token) {
        // Instead of returning the response directly here, use next()
        res.status(403).json({ message: "No token provided" });
        return ;
    }

    try {
        const secretKey = `${process.env.TOKENKEY}`;
        const decoded = jwt.verify(token, secretKey);

        req.user = decoded; // Attach the decoded token to req.user
        console.log("decoded data is : ",decoded);

        next(); // Proceed to the next middleware

    } catch (err) {
        console.error(err);
        // Return the error response only when needed
        res.status(401).json({ message: "Invalid or expired token" });
        return ;
    }
}
