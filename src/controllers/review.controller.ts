import { Request, Response } from 'express';
import {
  CreateReviewStruct,
  GetReviewsQueryStruct,
  ProductIdStruct,
} from '../structs/review.struct';
import { create, is } from 'superstruct';
import * as ReviewService from '../services/review.service';

//리뷰 등록
export const createReviewController = async (req: Request, res: Response) => {
  const { id: userId, type: userType } = req.user!;
  const { productId } = create(req.params, ProductIdStruct);
  const validatedData = create(req.body, CreateReviewStruct);

  const result = await ReviewService.createReview(
    userId,
    userType,
    productId,
    validatedData,
  );

  res.status(201).json(result);
};

//상품 리뷰 목록 조회
export const getReviewsController = async (req: Request, res: Response) => {
  const { productId } = create(req.params, ProductIdStruct);
  const { page, limit } = create(req.query, GetReviewsQueryStruct);

  const result = await ReviewService.getProductReviewsList(
    productId,
    page,
    limit,
  );

  res.status(200).json(result);
};
