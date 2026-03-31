import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  adminAppointmentsQuerySchema,
  cancelAppointmentParamSchema,
  createAppointmentBodySchema,
  myAppointmentsQuerySchema,
} from "../schemas/appointment.schemas.js";

const r = Router();

r.post("/", requireAuth, validate(createAppointmentBodySchema), (req, res, next) => {
  appointmentController.create(req, res).catch(next);
});

r.get("/me", requireAuth, validate(myAppointmentsQuerySchema, "query"), (req, res, next) => {
  appointmentController.listMine(req, res).catch(next);
});

r.delete("/:id", requireAuth, validate(cancelAppointmentParamSchema, "params"), (req, res, next) => {
  appointmentController.cancel(req, res).catch(next);
});

r.get("/", requireAuth, adminOnly, validate(adminAppointmentsQuerySchema, "query"), (req, res, next) => {
  appointmentController.listAll(req, res).catch(next);
});

export default r;
