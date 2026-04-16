import { AuthRole } from "../types/auth.js";
import jwt, { SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
    sub: string;
    email: string;
    role: AuthRole;
};

function getSecret(): string {
    const s = process.env.JWT_SECRET;
    if (!s || s.length < 16) {
        throw new Error('JWT_SECRET must be set and at least 16 characters');
    }
    return s;
}


function resolveExpiresInSeconds(): number {
    const raw = process.env.JWT_EXPIRES_IN;
    if (!raw) return 60 * 60 * 24 * 1;
    const n = Number(raw);
    if (!Number.isNaN(n) && n > 0) return n;
    const match = /^(\d+)([smhd])$/i.exec(raw.trim());
    if (!match) return 60 * 60 * 24 * 1;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return value * mult;
}

export function signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = { expiresIn: resolveExpiresInSeconds() };
    return jwt.sign(payload, getSecret(), options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === 'string' || decoded === null || typeof decoded !== 'object') {
        throw new Error('Invalid token payload');
    }
    const sub = (decoded as { sub?: unknown }).sub;
    const email = (decoded as { email?: unknown }).email;
    const role = (decoded as { role?: unknown }).role;
    if (typeof sub !== 'string' || !sub) throw new Error('Invalid token');
    if (typeof email !== 'string' || !email) throw new Error('Invalid token');
    if (role !== 'user' && role !== 'admin') throw new Error('Invalid token');
    return { sub, email, role };
}

