import prisma from "../utils/prismaClient.util";

export const findByBuyerId = async (buyerId: string) => {
  return await prisma.cart.findUnique({
    where: { buyerId },
  });
};

export const createCart = async (buyerId: string) => {
  return await prisma.cart.create({
    data: { buyerId },
  });
};

export const findCartWithDetails = async (buyerId: string) => {
  return await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items : {
        include: {
          product: {
            include: {
              store: true,
              stocks: { include: { size: true } }
            }
          }
        }
      }
    },
  });
} ;