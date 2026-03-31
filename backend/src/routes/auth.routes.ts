import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginBodySchema, registerBodySchema } from "../schemas/auth.schemas.js";

const r = Router();

r.post("/register", validate(registerBodySchema), (req, res, next) => {
  authController.register(req, res).catch(next);
});
r.post("/login", validate(loginBodySchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

export default r;
