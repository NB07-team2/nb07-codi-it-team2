import { ReviewListItem, ReviewResponse } from '../types/review.type';

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
