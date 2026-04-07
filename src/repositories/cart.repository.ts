import prisma from "../utils/prismaClient.util";

export const findByBuyerId = async (buyerId: string) => {
  return await prisma.cart.findUnique({
    where: { buyerId },
    // include 제거: 명세서 응답에 필요 없으므로 최적화
  });
};

export const createCart = async (buyerId: string) => {
  return await prisma.cart.create({
    data: { buyerId },
    // include 제거: 생성 시 응답 규격을 맞추기 위해 제외
  });
};