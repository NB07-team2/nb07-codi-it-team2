import { UserType } from "@prisma/client";

export {};

interface AuthUser {
  id: string;
  type: UserType;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}