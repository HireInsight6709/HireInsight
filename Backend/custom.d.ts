import { DecodedToken } from "./src/Authentication/token_auth";  // Import where your interface is defined

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;  // Allow req.user to be of type DecodedToken
        }
    }
}
