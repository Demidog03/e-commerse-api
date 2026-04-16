import { type NextFunction, type Request, type Response, type RequestHandler } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

function bearerToken(req: Request): string | undefined {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return undefined;
    const t = h.slice(7).trim();
    return t || undefined;
}

export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const p = verifyAccessToken(token);
        req.user = { sub: p.sub, email: p.email, role: p.role };
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};