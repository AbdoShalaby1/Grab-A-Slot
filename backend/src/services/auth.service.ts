import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function registerUser(data: { email: string; password: string; name: string; role?: "user" | "admin" }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role ?? "user",
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    // If admin, auto-generate a code
    if (data.role === "admin") {
      let code = generateCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await tx.adminCode.findUnique({ where: { code } });
        if (!existing) break;
        code = generateCode();
        attempts++;
      }
      
      if (attempts >= 10) {
        throw new AppError(500, "Failed to generate admin code");
      }

      await tx.adminCode.create({
        data: { code, adminId: user.id },
      });
    }

    return user;
  });
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
