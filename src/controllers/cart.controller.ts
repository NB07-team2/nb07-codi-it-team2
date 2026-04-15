import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as cartService from "../services/cart.service";
import { updateCartSchema, CartItemIdSchema } from "../structs/cart.struct";

export const createCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const cart = await cartService.createCart(user);

  res.status(201).json(cart);
});

export const getMyCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const cart = await cartService.getMyCart(user);

  res.status(200).json(cart);
})

export const updateCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const validatedData = updateCartSchema.parse(req.body);

  const { productId, sizes } = validatedData;

  const updatedItems = await cartService.updateCart(user, productId, sizes);
  
  res.status(200).json(updatedItems);
});

export const deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  const { cartItemId } = CartItemIdSchema.parse(req.params);

  await cartService.deleteCartItem(user, cartItemId);
  res.status(204).send();
});

export const getCartItemDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { cartItemId } = CartItemIdSchema.parse(req.params);

  const getItem = await cartService.getCartByItem(user, cartItemId);
  res.status(200).json(getItem);
})