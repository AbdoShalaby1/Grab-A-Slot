import { Router } from "express";
import * as adminTimeSlotController from "../controllers/adminTimeSlot.controller.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTimeSlotBodySchema,
  timeSlotIdParamSchema,
  updateTimeSlotBodySchema,
} from "../schemas/timeSlot.schemas.js";

const r = Router();

r.use(requireAuth, adminOnly);

r.post("/", validate(createTimeSlotBodySchema), (req, res, next) => {
  adminTimeSlotController.create(req, res).catch(next);
});

r.patch("/:id", validate(timeSlotIdParamSchema, "params"), validate(updateTimeSlotBodySchema), (req, res, next) => {
  adminTimeSlotController.update(req, res).catch(next);
});

r.delete("/:id", validate(timeSlotIdParamSchema, "params"), (req, res, next) => {
  adminTimeSlotController.remove(req, res).catch(next);
});

export default r;
