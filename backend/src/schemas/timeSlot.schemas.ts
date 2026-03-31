import { z } from "zod";

export const timeSlotQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  availableOnly: z.preprocess((v) => v === "true" || v === true, z.boolean().optional()),
  skip: z.coerce.number().int().nonnegative().default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const createTimeSlotBodySchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const updateTimeSlotBodySchema = z
  .object({
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((b) => b.startAt !== undefined || b.endAt !== undefined || b.isActive !== undefined, {
    message: "At least one field required",
  });

export const timeSlotIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
