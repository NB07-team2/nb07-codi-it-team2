import { UserType } from "@prisma/client";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        type: UserType;
      };
    }
  }
}