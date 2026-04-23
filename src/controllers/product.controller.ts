import { Request, Response } from 'express';
import { createProductbody, getProductsQuery } from '../structs/product.struct';
import {
  ProductListResponseDto,
  ProductResponseDto,
} from '../models/product.model';
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

// 상품 목록 조회 컨트롤러
export const getProductsListController = async (
  req: Request,
  res: Response,
) => {
  const query = getProductsQuery.parse(req.query);
  const { list, totalCount } = await productService.getProducts(query);

  // DTO 맵핑 (기존에 만든 DTO 재사용!)
  const formattedList = list.map(
    (product) => new ProductListResponseDto(product),
  );

  res.status(200).json({
    list: formattedList,
    totalCount,
  });
};
