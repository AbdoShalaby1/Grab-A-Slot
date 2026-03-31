import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function createAppointment(userId: number, timeSlotId: number) {
  try {
    return await prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
        include: { appointment: true },
      });
      if (!slot) {
        throw new AppError(404, "Time slot not found");
      }
      if (!slot.isActive) {
        throw new AppError(400, "Time slot is not available");
      }
      if (slot.appointment) {
        throw new AppError(409, "This time slot is already booked");
      }

      return tx.appointment.create({
        data: { userId, timeSlotId },
        include: {
          timeSlot: { select: { id: true, startAt: true, endAt: true } },
        },
      });
    });
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new AppError(409, "This time slot is already booked");
    }
    throw e;
  }
}

export async function listMyAppointments(userId: number, skip = 0, take = 20) {
  return prisma.appointment.findMany({
    where: { userId },
    include: {
      timeSlot: { select: { id: true, startAt: true, endAt: true, isActive: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export async function listAllAppointments(filters?: { from?: Date; to?: Date; skip?: number; take?: number }) {
  return prisma.appointment.findMany({
    where: {
      ...(filters?.from || filters?.to
        ? {
            timeSlot: {
              AND: [
                ...(filters.from ? [{ startAt: { gte: filters.from } }] : []),
                ...(filters.to ? [{ endAt: { lte: filters.to } }] : []),
              ],
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      timeSlot: { select: { id: true, startAt: true, endAt: true, isActive: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: filters?.skip,
    take: filters?.take,
  });
}

export async function deleteAppointment(appointmentId: number, userId: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }
  if (appointment.userId !== userId) {
    throw new AppError(403, "Cannot cancel another user's appointment");
  }
  await prisma.appointment.delete({ where: { id: appointmentId } });
}
