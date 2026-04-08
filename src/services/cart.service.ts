import * as cartRepository from "../repositories/cart.repository";
import { ForbiddenError, NotFoundError } from "../errors/errors";
import { SimpleUser } from "../types/cart.type";

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