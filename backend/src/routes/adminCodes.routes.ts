import { Router } from "express";
import * as adminCodeController from "../controllers/adminCode.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

r.post("/validate", (req, res, next) => {
  adminCodeController.validateCode(req, res).catch(next);
});

r.get("/my", requireAuth, (req, res, next) => {
  adminCodeController.getAdminCode(req, res).catch(next);
});

export default r;
