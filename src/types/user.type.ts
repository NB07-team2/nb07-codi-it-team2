import { User, Grade, UserType } from '@prisma/client';
import { Request } from 'express';

// 1. 서비스 반환용 응답 인터페이스 추가
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

// 2. Prisma 유저 모델에 Grade가 포함된 타입 추가
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