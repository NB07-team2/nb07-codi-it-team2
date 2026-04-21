import { Infer } from 'superstruct';
import { CreateReviewStruct } from '../structs/review.struct';

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
  order: { userId: string };
};
