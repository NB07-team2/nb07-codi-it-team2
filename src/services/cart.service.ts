import * as cartRepository from "../repositories/cart.repository";
import { ForbiddenError } from "../errors/errors";

export const createCart = async (user: any) => {
  // 1. 권한 체크
  if (user.type !== "BUYER") {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  // 2. 기존 장바구니 확인
  const existingCart = await cartRepository.findByBuyerId(user.id);
  
  if (existingCart) {
    return existingCart;
  }

  // 3. 새 장바구니 생성
  const newCart = await cartRepository.createCart(user.id);
  
  // 생성 시에도 include를 뺐으므로 바로 반환합니다.
  return newCart;
};