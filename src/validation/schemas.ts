import z from "zod";

export const authRegisterSchema = z.object({
    email: z.email().trim().toLowerCase().max(300),
    password: z.string().min(8).max(128),
    name: z.string().trim().max(200).optional(),
});

export const authLoginSchema = z.object({
    email: z.email().trim().toLowerCase().max(300),
    password: z.string().min(8).max(128),
});