import { Router } from "express";
import * as timeSlotController from "../controllers/timeSlot.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { timeSlotQuerySchema } from "../schemas/timeSlot.schemas.js";

const r = Router();

r.get("/", optionalAuth, validate(timeSlotQuerySchema, "query"), (req, res, next) => {
  timeSlotController.list(req, res).catch(next);
});

export default r;
