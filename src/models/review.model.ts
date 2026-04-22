import {
  ReviewDetailPayload,
  ReviewDetailResponse,
  ReviewListItem,
  ReviewResponse,
} from '../types/review.type';

//리뷰 등록 dto
export class CreateReivewResponseDto {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: ReviewResponse) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.orderItemId = data.orderItemId;
    this.content = data.content;
    this.rating = data.rating;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

//상품 리뷰 목록 dto
export class ReviewListResponseDto {
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

  constructor(data: ReviewListItem) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.orderItemId = data.orderItemId;
    this.rating = data.rating;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.user = {
      name: data.user.name,
    };
  }
}

//리뷰 상세조회 dto
export class ReviewDetailResponseDto implements ReviewDetailResponse {
  reviewId: string;
  productName: string;
  size: { en: string; ko: string };
  price: number;
  quantity: number;
  rating: number;
  content: string;
  reviewer: string;
  reviewCreatedAt: Date;
  purchasedAt: Date;

  constructor(data: ReviewDetailPayload) {
    this.reviewId = data.id;
    this.productName = data.product.name;
    // 사이즈 다국어 처리 (만약 DB에 영어만 있다면 동일하게 세팅)
    this.size = {
      en: data.orderItem?.size?.name || '',
      ko: data.orderItem?.size?.name || '',
    };
    this.price = data.product.price;
    this.quantity = data.orderItem?.quantity || 1;
    this.rating = data.rating;
    this.content = data.content;
    this.reviewer = data.user.name;
    this.reviewCreatedAt = data.createdAt;
    this.purchasedAt = data.orderItem?.order?.createdAt || new Date();
  }
}
