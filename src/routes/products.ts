import express from "express";
import { getSupabase } from "../lib/supabase.js";
import { tryParse } from "../lib/parse.js";
import { productCreateSchema, productIdParamSchema } from "../validation/schemas.js";

export const productRoutes = express.Router();

productRoutes.get("/", async (_req, res, next) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .select("id, name, description, price, image_url, scoville, stock, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      products: (data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.image_url,
        scoville: p.scoville,
        stock: p.stock,
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

productRoutes.get("/:id", async (req, res, next) => {
  try {
    const parsed = tryParse(productIdParamSchema, req.params);
    if (!parsed.ok) return res.status(400).json(parsed.payload);

    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .select("id, name, description, price, image_url, scoville, stock, created_at")
      .eq("id", parsed.value.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      product: {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        scoville: data.scoville,
        stock: data.stock,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

productRoutes.post("/", async (req, res, next) => {
  try {
    const parsed = tryParse(productCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json(parsed.payload);

    const { name, description, price, imageUrl, scoville, stock } = parsed.value;

    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .insert({
        name,
        description: description ?? null,
        price,
        image_url: imageUrl ?? null,
        scoville: scoville ?? null,
        stock: stock ?? 0,
      })
      .select("id, name, description, price, image_url, scoville, stock, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({
      product: {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        scoville: data.scoville,
        stock: data.stock,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

