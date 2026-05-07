import express, { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcrypt";
import { authLoginSchema, authRegisterSchema } from "../validation/schemas.js";
import { tryParse } from "../lib/parse.js";
import { getSupabase } from "../lib/supabase.js";
import { signAccessToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/guards.js";

export const authRoutes = express.Router();

const BCRYPT_ROUNDS = 10;

authRoutes.post('/register', async (req, res, next) => {
    try {
        const parsed = tryParse(authRegisterSchema, req.body);
        if (!parsed.ok) {
            return res.status(400).json(parsed.payload);
        }
        const { email, password, name } = parsed.value;
        const normalizedEmail = email.toLowerCase();
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const role = 'user';

        const sb = getSupabase()
        const { data, error } = await sb
            .from('users')
            .insert({ email: normalizedEmail, password_hash: passwordHash, role, name: name ?? null })
            .select('id, email, role, name, created_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            throw error;
        }

        const token = signAccessToken({ sub: data.id, email: data.email, role: data.role });
        res.status(201).json({
            token,
            user: {
                id: data.id,
                email: data.email,
                role: data.role,
                name: data.name,
                createdAt: data.created_at,
            }
        });
        
    }
    catch (err) {
      next(err)
    }
})

authRoutes.post('/login', async (req, res, next) => {
    try {
        const parsed = tryParse(authLoginSchema, req.body);

        if (!parsed.ok) {
            return res.status(400).json(parsed.payload);
        }

        const { email, password } = parsed.value;
        const normalizedEmail = email.toLowerCase();

        const sb = getSupabase()
        const { data, error } = await sb
            .from('users')
            .select('id, email, password_hash, role, name, created_at')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const ok = await bcrypt.compare(password, data.password_hash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = signAccessToken({ sub: data.id, email: data.email, role: data.role });
        res.status(200).json({
            token,
            user: {
                id: data.id,
                email: data.email,
                role: data.role,
                name: data.name,
                createdAt: data.created_at,
            }
        })
    }
    catch (err) {
        next(err)
    }
})

authRoutes.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const sb = getSupabase()

        const { data, error } = await sb
            .from('users')
            .select('id, email, role, name, created_at')
            .eq('id', user!.sub)
            .maybeSingle();

        if (error) {
            throw error;
        }
        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: data.id,
                email: data.email,
                role: data.role,
                name: data.name,
                createdAt: data.created_at,
            }
        })
    }
    catch (err) {
        next(err)
    }
})

authRoutes.post('/logout', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // JWT is stateless in this project; logout is handled client-side by deleting the token.
        // This endpoint exists for API symmetry and future token revocation support.
        return res.status(204).send();
    } catch (err) {
        next(err)
    }
})