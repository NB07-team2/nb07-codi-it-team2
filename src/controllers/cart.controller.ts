import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as cartService from "../services/cart.service";
import { BadRequestError } from "../errors/errors";

export const createCart = asyncHandler(async (req: Request, res: Response) => {
  // 미들웨어에서 검증된 user 객체 사용 (Non-null assertion 사용)
  const user = req.user!;

  // 서비스에 user 전체를 넘겨서 서비스가 권한 및 로직을 처리하게 함
  const cart = await cartService.createCart(user);

  // 서비스에서 가공된 DTO를 그대로 응답
  res.status(201).json(cart);
});

export const getMyCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const cart = await cartService.getMyCart(user);

  res.status(200).json(cart);
})

export const updateCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { productId, sizes } = req.body;

if (!productId || typeof productId !== 'string') {
    throw new BadRequestError("유효한 productId가 필요합니다.");
  }

if (!Array.isArray(sizes) || sizes.length === 0) {
  throw new BadRequestError("수정할 사이즈 정보가 최소 하나 이상 필요합니다.");
}

const isValid = sizes.every(item => 
  typeof item.sizeId === 'number' && 
  typeof item.quantity === 'number'
);

if (!isValid) {
  throw new BadRequestError("사이즈 ID와 수량은 모두 숫자여야 합니다.");
}

  const updatedItems = await cartService.updateCart(user, productId, sizes);
  res.status(200).json(updatedItems);
});