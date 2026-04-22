import { UserType } from '@prisma/client';
import { CreateReviewType } from '../types/review.type';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/errors';
import {
  CreateReivewResponseDto,
  ReviewListResponseDto,
} from '../models/review.model';
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

//상품 리뷰 목록 조회
export const getProductReviewsList = async (
  productId: string,
  pageStr?: string,
  limitStr?: string,
) => {
  const limit = Math.min(Number(limitStr) || 5, 50); //limit 상한치 고정
  const page = Math.max(1, Number(pageStr) || 1);

  const isProductExist = await reviewRepository.checkProductExists(productId);
  if (!isProductExist) {
    throw new NotFoundError('존재하지 않는 상품입니다.');
  }
  const { items, total } = await reviewRepository.findReviewsByProductId(
    productId,
    page,
    limit,
  );
  const mappedItems = items.map((item) => new ReviewListResponseDto(item));
  const hasNextPage = total > page * limit;

  return {
    items: mappedItems,
    meta: {
      total,
      page,
      limit,
      hasNextPage,
    },
  };
};
