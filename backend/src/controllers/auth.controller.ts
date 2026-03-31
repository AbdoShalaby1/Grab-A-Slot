import type { Request, Response } from "express";
import { signToken } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name: string;
  };
  const user = await authService.registerUser({ email, password, name });
  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await authService.loginUser(email, password);
  const token = signToken({ id: user.id, role: user.role });
  res.json({ user, token });
}
