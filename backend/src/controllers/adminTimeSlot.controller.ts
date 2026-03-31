import type { Request, Response } from "express";
import * as timeSlotService from "../services/timeSlot.service.js";

export async function create(req: Request, res: Response) {
  const { startAt, endAt } = req.body as { startAt: string; endAt: string };
  const adminId = req.user!.id;
  const slot = await timeSlotService.createTimeSlot(adminId, new Date(startAt), new Date(endAt));
  res.status(201).json({
    slot: {
      ...slot,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
    },
  });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as { startAt?: string; endAt?: string; isActive?: boolean };
  const slot = await timeSlotService.updateTimeSlot(id, {
    ...(body.startAt !== undefined ? { startAt: new Date(body.startAt) } : {}),
    ...(body.endAt !== undefined ? { endAt: new Date(body.endAt) } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  });
  res.json({
    slot: {
      ...slot,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
    },
  });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await timeSlotService.deleteTimeSlot(id);
  res.status(204).send();
}
