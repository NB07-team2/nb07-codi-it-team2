import { ReviewResponse } from '../types/review.type';

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
