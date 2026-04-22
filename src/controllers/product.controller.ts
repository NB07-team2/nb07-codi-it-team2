import { Request, Response } from 'express';
import { createProductbody } from '../structs/product.struct'; // 팀원 제안 반영
import * as productService from '../services/product.service';

export const createProductController = async (req: Request, res: Response) => {
  // req.body와 req.file을 한 번에 검증 및 파싱
  const validatedData = createProductbody.parse({
    ...req.body,
    image: req.file,
  });
  const { id: userId, type: userType } = req.user!;
  const result = await productService.createProduct(
    userId,
    userType,
    validatedData,
    req.file,
  );

  res.status(201).json(result);
};
