import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as cartService from "../services/cart.service";

export const createCart = asyncHandler(async (req: Request, res: Response) => {
  // 미들웨어에서 검증된 user 객체 사용 (Non-null assertion 사용)
  const user = req.user!;

  // 서비스에 user 전체를 넘겨서 서비스가 권한 및 로직을 처리하게 함
  const cart = await cartService.createCart(user);

  // 서비스에서 가공된 DTO를 그대로 응답
  res.status(201).json(cart);
});