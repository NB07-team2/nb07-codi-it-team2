import { Request, Response } from 'express';
import { registerSchema } from '../structs/auth.struct';
import * as userService from '../services/user.service';
import * as imageService from '../services/image.service';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthenticatedRequest } from '../types/user.type';
import { BadRequestError, EmailLowerCaseError } from '../errors/errors';

// 회원가입
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    // 💡 result.error.issues 를 사용하여 에러 목록을 가져옵니다.
    const { issues } = result.error;

    // 이메일 필드에 에러가 있는지 확인합니다.
    const hasEmailError = issues.some((issue) => issue.path.includes('email'));

    if (hasEmailError) {
      throw new EmailLowerCaseError();
    }
    throw new BadRequestError(issues[0]?.message);
  }

  // 성공 시 result.data 사용
  const user = await userService.register(result.data);
  res.status(201).json(user);
});

// 내 정보 조회
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;

  const user = await userService.getMe(userId);
  res.status(200).json(user);
});

// 내 정보 수정
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

// 관심 스토어 조회
export const getFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as unknown as AuthenticatedRequest;
    const { id: userId } = authReq.user;
    const favorites = await userService.getFavorites(userId);

    res.status(200).json(favorites);
  },
);

// 회원 탈퇴
export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const { id: userId } = authReq.user;

  await userService.deleteMe(userId);

  res.status(200).json({ message: '회원 탈퇴 성공' });
});
