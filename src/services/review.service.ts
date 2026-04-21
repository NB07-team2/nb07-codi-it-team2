import { UserType } from '@prisma/client';
import { CreateReviewType } from '../types/review.type';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/errors';
import { CreateReivewResponseDto } from '../models/review.model';
import { reviewRepository } from '../repositories/review.repository';

//리뷰 등록
export const createReview = async (
  userId: string,
  userType: UserType,
  productId: string,
  data: CreateReviewType,
) => {
  if (userType !== 'BUYER') throw new ForbiddenError('구매자만 가능합니다.');

  const { orderItemId } = data;

  const orderItem = await reviewRepository.findOrderItemForReview(orderItemId);
  if (!orderItem) throw new NotFoundError('해당 주문 항목을 찾을 수 없습니다.');

  if (orderItem.order.userId !== userId) {
    throw new ForbiddenError('본인이 구매한 상품만 작성 가능합니다.');
  }
  if (orderItem.productId !== productId) {
    throw new BadRequestError(
      '주문한 상품과 리뷰를 작성하려는 상품이 일치하지 않습니다.',
    );
  }
  //중복 리뷰 체크
  const existingReview =
    await reviewRepository.findReviewByOrderItemId(orderItemId);
  if (existingReview) throw new ConflictError('이미 리뷰가 존재합니다.');

  const newReview = await reviewRepository.createReview(
    userId,
    productId,
    data,
  );
  return new CreateReivewResponseDto(newReview);
};
