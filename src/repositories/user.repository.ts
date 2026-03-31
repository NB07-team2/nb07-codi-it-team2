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

