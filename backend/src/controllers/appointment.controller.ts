import type { Request, Response } from "express";
import * as appointmentService from "../services/appointment.service.js";

export async function create(req: Request, res: Response) {
  const { timeSlotId, adminCodeId } = req.body as { timeSlotId: number; adminCodeId: number };
  const userId = req.user!.id;
  const appointment = await appointmentService.createAppointment(userId, timeSlotId, adminCodeId);
  res.status(201).json({
    appointment: {
      id: appointment.id,
      createdAt: appointment.createdAt.toISOString(),
      timeSlot: {
        ...appointment.timeSlot,
        startAt: appointment.timeSlot.startAt.toISOString(),
        endAt: appointment.timeSlot.endAt.toISOString(),
      },
    },
  });
}

export async function listMine(req: Request, res: Response) {
  const q = req.query as { skip?: string; take?: string };
  const skip = q.skip ? Number(q.skip) : 0;
  const take = q.take ? Number(q.take) : 20;
  const rows = await appointmentService.listMyAppointments(req.user!.id, skip, take);
  res.json({
    appointments: rows.map((a) => ({
      id: a.id,
      createdAt: a.createdAt.toISOString(),
      timeSlot: {
        ...a.timeSlot,
        startAt: a.timeSlot.startAt.toISOString(),
        endAt: a.timeSlot.endAt.toISOString(),
      },
    })),
  });
}

export async function listAll(req: Request, res: Response) {
  const q = req.query as { from?: string; to?: string; skip?: string; take?: string };
  const rows = await appointmentService.listAllAppointments({
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
    skip: q.skip ? Number(q.skip) : undefined,
    take: q.take ? Number(q.take) : undefined,
  });
  res.json({
    appointments: rows.map((a) => ({
      id: a.id,
      createdAt: a.createdAt.toISOString(),
      user: a.user,
      timeSlot: {
        ...a.timeSlot,
        startAt: a.timeSlot.startAt.toISOString(),
        endAt: a.timeSlot.endAt.toISOString(),
      },
    })),
  });
}

export async function cancel(req: Request, res: Response) {
  const appointmentId = Number(req.params.id);
  const userId = req.user!.id;
  await appointmentService.deleteAppointment(appointmentId, userId);
  res.status(204).send();
}
