import { z } from "zod";

export const createAppointmentBodySchema = z.object({
  timeSlotId: z.coerce.number().int().positive(),
});

export const cancelAppointmentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const paginationSchema = z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminAppointmentsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  ...paginationSchema.shape,
});

export const myAppointmentsQuerySchema = z.object({
  ...paginationSchema.shape,
});
