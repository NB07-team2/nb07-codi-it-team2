import { Request, Response, NextFunction } from "express";
import { createProductService } from "../services/products.service";
import prisma from "../utils/prismaClient.util";
import * as arror from '../errors/errors';
import { createProductbody } from "../structs/products.schema.structs";

// 상품 등록
export const createProductController = async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new arror.UnauthorizedError('인증이 필요합니다.');
    }

    const validated = createProductbody.parse(req.body);
    const created = await createProductService(prisma, userId, validated);

    res.status(201).json(created);
}