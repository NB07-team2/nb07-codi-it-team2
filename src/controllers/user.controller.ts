import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as imageService from '../services/image.service';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthenticatedRequest } from '../types/user.type';

// 1. 회원가입 (POST /api/users)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  res.status(201).json(user);
});

// 2. 내 정보 조회 (GET /api/users/me)
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;

  const user = await userService.getMe(userId);
  res.status(200).json(user);
});

// 3. 내 정보 수정 (PATCH /api/users/me)
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;
  let imageUrl = req.body.image;

  if (req.file) {
    const { url } = await imageService.uploadImage(req.file);
    imageUrl = url;
  }
  
  const updateData = {
    ...req.body,
    image: imageUrl,
  };

  const updatedUser = await userService.updateMe(userId, updateData);
  res.status(200).json(updatedUser);
});

// 4. 관심 스토어 조회 (GET /api/users/me/likes)
export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;

  const favorites = await userService.getFavorites(userId);
  res.status(200).json(favorites);
});

// 5. 회원 탈퇴 (DELETE /api/users/delete)
export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;

  await userService.deleteMe(userId);
  res.status(200).json({ message: '회원 탈퇴 성공' });
});