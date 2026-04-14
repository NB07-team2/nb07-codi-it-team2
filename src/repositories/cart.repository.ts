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
    where: {
      productId,
      sizeId,
    },
  });
};

export const upsertCartItem = async (
  cartId: string,
  productId: string,
  sizeId: number,
  stockId: string,
  quantity: number
) => {
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      sizeId,
    },
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity, stockId }, 
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId,
      productId,
      sizeId,
      stockId,
      quantity,
    },
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