import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from './env.js';

export interface JwtPayload {
  userId: string;
}

export interface JwtVerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  expired?: boolean;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId } as JwtPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId } as JwtPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtVerifyResult => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      clockTolerance: process.env.NODE_ENV === 'test' ? 0 : 30,
    }) as JwtPayload;
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        expired: true,
      };
    }
    return {
      valid: false,
      expired: false,
    };
  }
};

export const verifyRefreshToken = (token: string): JwtVerifyResult => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      clockTolerance: process.env.NODE_ENV === 'test' ? 0 : 30,
    }) as JwtPayload;
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        expired: true,
      };
    }
    return {
      valid: false,
      expired: false,
    };
  }
};
