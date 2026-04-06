import { Request, Response } from 'express';
import { InvalidRequestError } from '../errors/errors';
import { loginSchema } from '../structs/auth.schema.struct';
import * as authService from '../services/auth.service';

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData);

  if (!result) {
    throw new Error('Service returned undefined or null');
  }
  const { response, refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
  const userId = req.user?.id;

  if (userId) {
    await authService.logout(userId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
};
