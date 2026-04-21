import { Request, Response } from 'express';
import { CreateReviewStruct, ProductIdStruct } from '../structs/review.struct';
import { create } from 'superstruct';
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
