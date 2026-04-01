import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import adminCodesRoutes from "./routes/adminCodes.routes.js";
import adminTimeSlotsRoutes from "./routes/adminTimeSlots.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import authRoutes from "./routes/auth.routes.js";
import timeSlotsRoutes from "./routes/timeSlots.routes.js";

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/time-slots", timeSlotsRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/admin/codes", adminCodesRoutes);
  app.use("/api/admin/time-slots", adminTimeSlotsRoutes);

  app.use(errorHandler);
  return app;
}
