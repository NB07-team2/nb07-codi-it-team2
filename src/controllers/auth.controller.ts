import { Request, Response } from 'express';
//import { env } from '../utils/env.js';
import { InvalidRequestError } from '../errors/errors.js';
import { loginSchema } from '../structs/auth.schema.struct.js'
import * as authService from '../services/auth.service.js';

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const validatedData = loginSchema.parse(req.body);
  const {response, refreshToken} = await authService.login(validatedData);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' });

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
  res.status(200).json({ message: "성공적으로 로그아웃되었습니다." });
};