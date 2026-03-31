import type { Request, Response } from "express";
import * as timeSlotService from "../services/timeSlot.service.js";

export async function list(req: Request, res: Response) {
  const q = req.query as {
    from?: string;
    to?: string;
    availableOnly?: boolean;
    skip?: string;
    take?: string;
  };
  const slots = await timeSlotService.listTimeSlots({
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
    availableOnly: q.availableOnly === true,
    currentUserId: req.user?.id,
    skip: q.skip ? Number(q.skip) : undefined,
    take: q.take ? Number(q.take) : undefined,
  });
  res.json({ slots });
}
