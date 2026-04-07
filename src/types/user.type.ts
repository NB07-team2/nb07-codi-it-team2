import { User, Grade, UserType } from '@prisma/client';
import { Request } from 'express';

// 유저 응답 인터페이스
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

export interface UserWithGrade extends User {
  grade: Grade;
}

// DB 객체를 응답 DTO로 변환하는 매핑 함수
export const toUserResponse = (user: UserWithGrade): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: user.type,
  points: user.points,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  grade: {
    name: user.grade.name,
    id: user.grade.id,
    rate: user.grade.rate,
    minAmount: user.grade.minAmount,
  },
  image: user.image,
});

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
