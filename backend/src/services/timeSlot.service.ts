import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function listTimeSlots(options: {
  from?: Date;
  to?: Date;
  availableOnly?: boolean;
  currentUserId?: number;
  skip?: number;
  take?: number;
}) {
  const { from, to, availableOnly, currentUserId, skip, take } = options;

  const slots = await prisma.timeSlot.findMany({
    where: {
      ...(from || to
        ? {
            AND: [
              ...(from ? [{ startAt: { gte: from } }] : []),
              ...(to ? [{ endAt: { lte: to } }] : []),
            ],
          }
        : {}),
    },
    include: {
      appointment: { select: { id: true, userId: true } },
    },
    orderBy: { startAt: "asc" },
    skip,
    take,
  });

  const withAvailability = slots.map((s) => {
    const appt = s.appointment;
    const hasBooking = appt !== null;
    const bookedByMe = Boolean(currentUserId && appt && appt.userId === currentUserId);
    const available = s.isActive && !hasBooking;
    return {
      id: s.id,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      isActive: s.isActive,
      available,
      bookedByMe,
      appointmentId: appt?.id ?? null,
    };
  });

  if (availableOnly) {
    return withAvailability.filter((s) => s.available);
  }
  return withAvailability;
}

export async function createTimeSlot(adminId: number, startAt: Date, endAt: Date) {
  if (endAt <= startAt) {
    throw new AppError(400, "endAt must be after startAt");
  }
  return prisma.timeSlot.create({
    data: {
      startAt,
      endAt,
      createdById: adminId,
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      isActive: true,
      createdById: true,
    },
  });
}

export async function updateTimeSlot(
  id: number,
  data: { startAt?: Date; endAt?: Date; isActive?: boolean }
) {
  const slot = await prisma.timeSlot.findUnique({
    where: { id },
    include: { appointment: true },
  });
  if (!slot) {
    throw new AppError(404, "Time slot not found");
  }

  const startAt = data.startAt ?? slot.startAt;
  const endAt = data.endAt ?? slot.endAt;
  if (endAt <= startAt) {
    throw new AppError(400, "endAt must be after startAt");
  }

  return prisma.timeSlot.update({
    where: { id },
    data: {
      ...(data.startAt !== undefined ? { startAt: data.startAt } : {}),
      ...(data.endAt !== undefined ? { endAt: data.endAt } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      isActive: true,
      createdById: true,
    },
  });
}

export async function deleteTimeSlot(id: number) {
  const slot = await prisma.timeSlot.findUnique({
    where: { id },
    include: { appointment: true },
  });
  if (!slot) {
    throw new AppError(404, "Time slot not found");
  }
  if (slot.appointment) {
    throw new AppError(
      409,
      "Cannot delete a slot that has a booking. Deactivate it instead (PATCH isActive: false)."
    );
  }
  await prisma.timeSlot.delete({ where: { id } });
}
