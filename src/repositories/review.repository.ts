import { CreateReviewType, OrderItemWithOrder } from '../types/review.type';
import prisma from '../utils/prismaClient.util';

export const reviewRepository = {
  //리뷰 쓸 주물 내역 찾기
  findOrderItemForReview: async (
    orderItemId: string,
  ): Promise<OrderItemWithOrder | null> => {
    return await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        id: true,
        productId: true,
        order: { select: { userId: true } },
      },
    });
  },
  //이미 등록된 리뷰가 있는지 확인
  findReviewByOrderItemId: async (orderItemId: string) => {
    return await prisma.review.findUnique({
      where: { orderItemId },
    });
  },
  //리뷰 등록
  createReview: async (
    userId: string,
    productId: string,
    data: CreateReviewType,
  ) => {
    return await prisma.review.create({
      data: {
        userId,
        productId,
        orderItemId: data.orderItemId,
        rating: data.rating,
        content: data.content,
      },
    });
  },
};
