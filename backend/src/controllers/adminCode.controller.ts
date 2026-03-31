import type { Request, Response } from "express";
import * as adminCodeService from "../services/adminCode.service.js";
import { AppError } from "../utils/AppError.js";

export async function validateCode(req: Request, res: Response) {
  const { code } = req.body as { code: string };
  if (!code) {
    throw new AppError(400, "Code is required");
  }

  const adminCode = await adminCodeService.validateAdminCode(code);
  res.json({ id: adminCode.id, adminId: adminCode.adminId, code: adminCode.code });
}

export async function getAdminCode(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const adminCode = await adminCodeService.getAdminCodeByAdminId(userId);
  res.json({ code: adminCode.code });
}
