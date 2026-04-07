import { NextFunction, Request, Response } from 'express';
import {
  LoginRequiredError,
  TokenExpiredError,
  UnauthorizedError,
} from '../errors/errors';
import { verifyAccessToken } from '../utils/jwt.util';
import { TokenPayload } from '../types/jwt.type';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  // 토큰이 헤더에 없다면 쿠키에서 추출 시도
  if (!token && req.cookies) {
    token = req.cookies['access-token'];
  }

  if (!token) {
    return next(new UnauthorizedError());
  }

  // 토큰 검증
  const result = verifyAccessToken(token);

  if (!result.valid) {
    if (result.expired) {
      return next(new TokenExpiredError());
    }
    return next(new LoginRequiredError());
  }

  const payload = result.payload as TokenPayload;
  req.user = {
    id: payload.userId,
    type: payload.type,
  };
  next();
};
