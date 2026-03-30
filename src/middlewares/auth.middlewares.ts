import { NextFunction, Request, Response } from 'express';
import { LoginRequiredError, TokenExpiredError } from '../errors/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // 헤더에 없다면 쿠키에서 추출 시도
  if (!token && req.cookies) {
    token = req.cookies['access-token'];
  }

  // 토큰이 아예 없는 경우
  if (!token) {
    return next(new LoginRequiredError()); // Express 에러 핸들러로 전달
  }

  // 토큰 검증
  const result = verifyAccessToken(token);
  
  if (!result.valid) {
    if (result.expired) {
      return next(new TokenExpiredError());
    }
    return next(new LoginRequiredError());
  }

  // req.user에 페이로드 정보 저장
  req.user = {
    id: result.payload!.userId,
  };

  next();
};