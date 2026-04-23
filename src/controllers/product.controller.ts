import { Request, Response } from 'express';
import { createProductbody, getProductsQuery } from '../structs/product.struct';
import { ProductListResponseDto } from '../models/product.model';
import * as productService from '../services/product.service';

// 새 상품 등록
export const createProductController = async (req: Request, res: Response) => {
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
  const formattedList = list.map(
    (product) => new ProductListResponseDto(product),
  );

  res.status(200).json({
    list: formattedList,
    totalCount,
  });
};

// 상품 상세 조회
export const getProductDetailController = async (
  req: Request,
  res: Response,
) => {
  const productId = req.params.productId as string;
  const productDetail = await productService.getProductDetail(productId);

  res.status(200).json(productDetail);
};
