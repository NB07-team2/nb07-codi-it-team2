import { User, Grade, UserType } from '@prisma/client';
import { Request } from 'express';

// 서비스 반환용 응답 인터페이스
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  type: UserType;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  grade: {
    name: string;
    id: string;
    rate: number;
    minAmount: number;
  };
  image: string;
}

// Prisma 유저 모델에 Grade가 포함된 타입
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

// update
export interface UpdateMeDto {
  name?: string;
  password?: string; 
  currentPassword: string; 
  image?: string;
}

// User 회원가입 추가 모델
export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  image?: string;
}