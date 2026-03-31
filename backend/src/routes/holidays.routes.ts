import { Router } from "express";
import * as holidayController from "../controllers/holiday.controller.js";
import { validate } from "../middleware/validate.js";
import { holidaysQuerySchema } from "../schemas/holiday.schemas.js";

const r = Router();

r.get("/", validate(holidaysQuerySchema, "query"), (req, res, next) => {
  holidayController.list(req, res).catch(next);
});

export default r;
