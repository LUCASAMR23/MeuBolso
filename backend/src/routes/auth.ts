import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { database } from "../database.js";

const router = Router();
const tokenFor = (id: string) => jwt.sign({}, process.env.JWT_SECRET!, { subject: id, expiresIn: "7d" });

router.post("/register", async (request, response, next) => {
  try {
    const { name, email, password } = request.body as Record<string, string>;
    if (!name || !email || !password || password.length < 8) return response.status(400).json({ message: "Informe nome, e-mail e uma senha de pelo menos 8 caracteres." });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await database.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email", [name.trim(), email.toLowerCase().trim(), passwordHash]);
    const user = result.rows[0];
    return response.status(201).json({ user, token: tokenFor(user.id) });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "23505") return response.status(409).json({ message: "Este e-mail já está cadastrado." });
    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body as Record<string, string>;
    const result = await database.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email?.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password ?? "", user.password_hash))) return response.status(401).json({ message: "E-mail ou senha inválidos." });
    return response.json({ user: { id: user.id, name: user.name, email: user.email }, token: tokenFor(user.id) });
  } catch (error) { next(error); }
});

export default router;
