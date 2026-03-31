import { z } from "zod";

export const holidaysQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  country: z.string().length(2).toUpperCase(),
});
