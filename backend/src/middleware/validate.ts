import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      if (part === "body") {
        req.body = parsed as Request["body"];
      } else if (part === "query") {
        Object.assign(req.query as object, parsed as object);
      } else {
        Object.assign(req.params, parsed as object);
      }
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: e.flatten(),
        });
      }
      next(e);
    }
  };
}
