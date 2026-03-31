import type { Role } from "@prisma/client";

export type AuthUser = {
  id: number;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
