import * as cartRepository from "../repositories/cart.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/errors";
import { SimpleUser } from "../types/cart.type";
import prisma from "../utils/prismaClient.util";

export const createCart = async (user: SimpleUser) => {
  if (user.type !== "BUYER") {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  const existingCart = await cartRepository.findByBuyerId(user.id);
  
  if (existingCart) {
    return {
      message: "이미 존재하는 장바구니 입니다.",
      ...existingCart,
    };
  }

  const newCart = await cartRepository.createCart(user.id);
  
  return newCart;
};

export const getMyCart = async (user: SimpleUser) => {
  if (user.type !== 'BUYER') {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  const cart = await cartRepository.findCartWithDetails(user.id);
  
  if(!cart) {
    throw new NotFoundError("요청한 리소스를 찾을 수 없습니다.");
  }

  return cart;
}

export const updateCart = async (
  user: SimpleUser,
  productId: string,
  sizes: { sizeId: number; quantity: number }[]
) => {
  if (user.type !== "BUYER") {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  return await prisma.$transaction(async (tx) => {
    const cart = await cartRepository.findByBuyerId(user.id);
    if (!cart) {
      throw new NotFoundError("장바구니가 존재하지 않습니다.");
    }

    const product = await cartRepository.findProductById(productId);
    if (!product) {
      throw new BadRequestError(`존재하지 않는 상품 ID입니다.`);
    }

    const results = await Promise.all(
      sizes.map(async (item) => {
        const stock = await cartRepository.findStock(productId, item.sizeId);

        if (!stock) {
          throw new BadRequestError(`${product.name}의 해당 사이즈가 존재하지 않습니다.`);
        }

        if (item.quantity < 1) {
          throw new BadRequestError("수량은 1개 이상이어야 합니다.");
        }

        const updatedItem = await cartRepository.upsertCartItemWithTx(
          tx, 
          cart.id,
          productId,
          item.sizeId,
          stock.id,
          item.quantity
        );

        const { stockId, ...rest } = updatedItem;
        return rest;
      })
    );
    return results;
  });
};