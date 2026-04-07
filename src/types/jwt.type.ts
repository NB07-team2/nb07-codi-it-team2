import { UserType } from '@prisma/client';

export interface JwtPayload {
  userId: string;
}

export interface TokenPayload {
  userId: string;
  type: UserType;
}

export interface JwtVerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  expired?: boolean;
}
