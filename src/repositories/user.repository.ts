import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prismaClient.util';

// 유저 - 이메일로 조회
export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      grade: true,
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
export const create = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data,
    include: { grade: true },
  });
};

// 내 정보 수정
export const update = async (id: string, data: Prisma.UserUpdateInput) => {
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

// 모든 등급 기준 조회
export const findAllGrades = async () => {
  return await prisma.grade.findMany({
    orderBy: { minAmount: 'desc' },
  });
};