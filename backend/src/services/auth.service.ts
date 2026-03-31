import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function registerUser(data: { email: string; password: string; name: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "Invalid email or password");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
