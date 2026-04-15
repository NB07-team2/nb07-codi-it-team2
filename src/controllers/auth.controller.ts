import { Request, Response } from 'express';
import { InvalidRequestError } from '../errors/errors';
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

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(201).json(response);
};

// 토큰 갱신
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new InvalidRequestError();
  }

  const refreshToken = authHeader.substring(7);
  const tokens = await authService.refreshTokens(refreshToken);

  res.status(200).json(tokens);
};

// 로그아웃
export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;

  if (token) {
    await authService.logout(token);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);

  res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
};
