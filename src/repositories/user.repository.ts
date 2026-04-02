// repositories/user.repository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 유저 - 이메일로 조회
export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      grade: true, // AuthUserResponseDto에서 등급 정보 - 필수
    },
  });
};

// 유저 - ID로 조회
export const findById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      grade: true,
    },
  });
};

// 회원가입
export const create = async (data: any) => {
  return await prisma.user.create({
    data,
    include: { grade: true },
  });
};

// 정보 수정
export const update = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
    include: { grade: true },
  });
};

// 관심 스토어 조회
export const findFavoritesByUserId = async (userId: string) => {
  return await prisma.favorite.findMany({
    where: { userId },
    include: { store: true },
  });
};

// 회원 탈퇴
export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};