import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.js";

type AppJwtPayload = { sub: number; role: string };

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

export function signToken(user: { id: number; role: string }): string {
  return jwt.sign({ sub: user.id, role: user.role }, getSecret(), {
    expiresIn: "7d",
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(token, getSecret()) as unknown as AppJwtPayload;
    req.user = { id: decoded.sub, role: decoded.role as AuthUser["role"] };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, getSecret()) as unknown as AppJwtPayload;
    req.user = { id: decoded.sub, role: decoded.role as AuthUser["role"] };
  } catch {
    /* ignore invalid optional token */
  }
  next();
}
