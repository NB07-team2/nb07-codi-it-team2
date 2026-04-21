import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // multipart/form-data로 들어온 문자열 데이터를 파싱 (stocks 등)
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      stocks:
        typeof req.body.stocks === 'string'
          ? JSON.parse(req.body.stocks)
          : req.body.stocks,
      discountRate: req.body.discountRate
        ? Number(req.body.discountRate)
        : undefined,
    };

    const result = await productService.createProduct(
      req.user!.id,
      req.user!.type,
      productData,
      req.file,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
