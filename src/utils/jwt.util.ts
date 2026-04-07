import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from './env.util';
import { UserType } from '@prisma/client';
import { JwtPayload, JwtVerifyResult } from '../types/jwt.type';

// 액세스 토큰 생성
export const generateAccessToken = (userId: string, type: UserType): string => {
  return jwt.sign({ userId, type } as JwtPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};

// 리프레시 토큰 생성
export const generateRefreshToken = (
  userId: string,
  type: UserType,
): string => {
  return jwt.sign({ userId, type } as JwtPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

// 액세스 토큰 검증
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

// 리프레시 토큰 검증
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
