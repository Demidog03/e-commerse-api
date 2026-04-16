import type { AccessTokenPayload } from "../lib/jwt.js";

declare module "express-serve-static-core" {
    interface Request {
        user?: AccessTokenPayload;
    }
}

export {};
