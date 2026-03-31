import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function validateAdminCode(code: string) {
  const adminCode = await prisma.adminCode.findUnique({
    where: { code },
    include: {
      admin: { select: { id: true, name: true } },
    },
  });

  if (!adminCode || !adminCode.isActive) {
    throw new AppError(400, "Invalid or inactive code");
  }

  return adminCode;
}

export async function getAdminCodeByAdminId(adminId: number) {
  const adminCode = await prisma.adminCode.findUnique({
    where: { adminId },
  });

  if (!adminCode) {
    throw new AppError(404, "Admin code not found");
  }

  return adminCode;
}
