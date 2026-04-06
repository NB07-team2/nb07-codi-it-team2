import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as cartService from "../services/cart.service";
import { BadRequestError, ForbiddenError } from "../errors/errors";

export const createCart = asyncHandler(async(req:Request, res:Response) => {
    const user = req.user;

    if(!user || !user.id) {
        throw new BadRequestError("잘못된 요청 입니다.");
    }

    if(user.type !== 'BUYER') {
        throw new ForbiddenError("접근 권한이 없습니다.");
    }

    const cart = await cartService.createCart({buyerId: user.id});
    res.status(201).json({
        id: cart.id,
        buyerId: cart.buyerId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
    })
})