import { Prisma } from "@prisma/client";
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

export const findStock = async (productId: string, sizeId: number) => {
  return await prisma.stock.findFirst({
    where: { productId, sizeId },
  });
};

export const findProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};

export const findCartWithDetails = async (buyerId: string) => {
  return await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
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
};

export const upsertCartItemWithTx = async (
  tx: Prisma.TransactionClient, 
  cartId: string,
  productId: string,
  sizeId: number,
  stockId: string,
  quantity: number
) => {
  const existingItem = await tx.cartItem.findFirst({
    where: { cartId, productId, sizeId },
  });

  if (existingItem) {
    return await tx.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity, stockId },
    });
  }

  return await tx.cartItem.create({
    data: { cartId, productId, sizeId, stockId, quantity },
  });
};

export const findCartItemById = async (id: string) => {
  return await prisma.cartItem.findUnique({
    where: { id },
  });
};

export const deleteCartItemById = async (id: string) => {
  return await prisma.cartItem.delete({
    where: { id },
  });
};

export const findCartItemWithDetails = async (id: string) => {
  return await prisma.cartItem.findUnique({
    where: { id },
    select: {
      // 1. CartItem 본체의 필드들
      id: true,
      cartId: true,
      productId: true,
      sizeId: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      // stockId는 명세서에 없으므로 적지 않으면 제외됩니다.

      // 2. Product에서 필요한 것만 골라오기
      product: {
        select: {
          id: true,
          storeId: true,
          name: true,
          price: true,
          image: true,
          discountRate: true,
          discountStartTime: true,
          discountEndTime: true,
          createdAt: true,
          updatedAt: true,
          // content, isSoldOut, sales 등은 여기서 빠집니다.
        },
      },

      // 3. Cart에서 필요한 것만 골라오기
      cart: {
        select: {
          id: true,
          buyerId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};