import "dotenv/config";
import express, { NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/products.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ message: "API is running" });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ message });
});

app.listen(port, () => {
    console.log(`API listening on port http://localhost:${port}`);
});