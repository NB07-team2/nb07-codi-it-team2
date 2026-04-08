import { User, Grade, UserType } from '@prisma/client';
import { Request } from 'express';

export interface UserWithGrade extends User {
  grade: Grade;
}

// 인증된 요청
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    type: UserType;
  };
}

// 유저 정보 수정
export interface UpdateMeDto {
  name?: string;
  password?: string;
  currentPassword: string;
  image?: string;
}

// 회원가입 모델
export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  image?: string;
}
