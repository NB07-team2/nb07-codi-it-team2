import { Infer } from 'superstruct';
import { CreateReviewStruct } from '../structs/review.struct';
import { Prisma } from '@prisma/client';
import { reviewDetailInclude } from '../repositories/review.repository';

export type CreateReviewType = Infer<typeof CreateReviewStruct>;

export type ReviewResponse = {
  id: string;
  userId: string;
  productId: string;
  content: string;
  rating: number;
  orderItemId: string;
  createdAt: Date;
  updatedAt: Date;
};

//주문 아이템 조회 시 필요한 리턴 타입
export type OrderItemWithOrder = {
  id: string;
  productId: string;
  order: {
    userId: string;
    payments: {
      status: string;
    } | null;
  };
};

//리뷰 아이템 리스트 타입
export interface ReviewListItem {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
  };
}

//리뷰 상세 조회 타입
export interface ReviewDetailResponse {
  reviewId: string;
  productName: string;
  size: {
    en: string;
    ko: string;
  };
  price: number;
  quantity: number;
  rating: number;
  content: string;
  reviewer: string;
  reviewCreatedAt: Date;
  purchasedAt: Date;
}

//리뷰 상세조회 반환 타입
export type ReviewDetailPayload = Prisma.ReviewGetPayload<{
  include: typeof reviewDetailInclude;
}>;

export interface UpdateReviewInput {
  rating?: number;
  content?: string;
}
