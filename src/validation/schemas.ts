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

export const productIdParamSchema = z.object({
    id: z.uuid(),
});

export const productCreateSchema = z.object({
    name: z.string().trim().min(1).max(300),
    description: z.string().trim().max(5000).optional(),
    price: z.coerce.number().finite().min(0),
    imageUrl: z.string().trim().url().optional(),
    scoville: z.coerce.number().int().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
});