import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import * as holidayService from "../services/holiday.service.js";

export async function list(req: Request, res: Response) {
  const { year, country } = req.query as unknown as { year: number; country: string };
  try {
    const holidays = await holidayService.fetchPublicHolidays(year, country);
    res.json({ holidays });
  } catch {
    throw new AppError(502, "Failed to load holidays");
  }
}
