import { Request, Response } from 'express';
import { loginSchema } from '../structs/auth.struct';
import * as authService from '../services/auth.service';
import {
  NODE_ENV,
  REFRESH_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_NAME,
} from '../utils/constants.util';

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData);

  if (!result) {
    throw new Error('Service returned undefined or null');
  }

  const { response, refreshToken } = result;
  const isProduction = NODE_ENV === 'production';

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    // 배포 환경(HTTPS)에서는 true, 로컬(HTTP)에서는 false
    httpOnly: true,
    secure: isProduction,
    // 배포 환경에서는 'none' (크로스 도메인 허용), 로컬에서는 'lax'
    sameSite: isProduction ? 'none' : 'lax',
    // .codiit.site로 설정 - 앞에 어떤 서브 도메인이든 쿠키 공유 가능
    domain: isProduction ? '.codiit.site' : undefined,
  });

  res.status(201).json(response);
};

// 토큰 갱신
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    res.status(400).json({ message: '리프레시 토큰이 없습니다.' });
    return;
  }
  const tokens = await authService.refreshTokens(refreshToken);

  res.status(200).json(tokens);
};

// 로그아웃
export const logout = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId) {
    await authService.logout(userId);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);

  res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
};
