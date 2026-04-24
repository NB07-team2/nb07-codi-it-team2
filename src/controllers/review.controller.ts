import { Request, Response } from 'express';
import {
  CreateReviewStruct,
  GetReviewsQueryStruct,
  ProductIdStruct,
  ReviewIdParamStruct,
  UpdateReviewStruct,
} from '../structs/review.struct';
import { create } from 'superstruct';
import * as ReviewService from '../services/review.service';
import { ForbiddenError } from '../errors/errors';

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

//리뷰 상세조회
export const getReviewDetailController = async (
  req: Request,
  res: Response,
) => {
  const { reviewId } = create(req.params, ReviewIdParamStruct);

  const { id: userId, type: userType } = req.user!;

  const result = await ReviewService.getReviewDetail(
    reviewId,
    userId,
    userType,
  );

  res.status(200).json(result);
};

//리뷰 수정
export const updateReviewController = async (req: Request, res: Response) => {
  const { reviewId } = create(req.params, ReviewIdParamStruct);
  const { id: userId, type: userType } = req.user!;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ForbiddenError('수정할 내용이 없습니다.');
  }

  const validatedData = create(req.body, UpdateReviewStruct);

  const result = await ReviewService.updateReview(
    reviewId,
    userId,
    userType,
    validatedData,
  );

  res.status(200).json(result);
};

//리뷰 삭제
export const deleteReviewController = async (req: Request, res: Response) => {
  const { reviewId } = create(req.params, ReviewIdParamStruct);
  const { id: userId, type: userType } = req.user!;

  await ReviewService.deleteReview(reviewId, userId, userType);

  return res.status(204).send();
};
