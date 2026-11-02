import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";
import financeRouter from "./routes/finance.js";
import { requireAuth } from "./middleware/auth.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET não foi configurado.");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", requireAuth, financeRouter);
app.use((_request, response) => response.status(404).json({ message: "Rota não encontrada." }));
app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => { console.error(error); response.status(500).json({ message: "Ocorreu um erro interno." }); });
app.listen(Number(process.env.PORT) || 3333, () => console.log("API em execução na porta 3333"));
