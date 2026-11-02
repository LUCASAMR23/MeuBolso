import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request { userId?: string }

export function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) return response.status(401).json({ message: "Token de acesso não informado." });

  try {
    request.userId = (jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }).sub;
    next();
  } catch {
    return response.status(401).json({ message: "Token inválido ou expirado." });
  }
}
