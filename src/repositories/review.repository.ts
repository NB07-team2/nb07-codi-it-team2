import { Prisma } from '@prisma/client';
import {
  CreateReviewType,
  OrderItemWithOrder,
  UpdateReviewInput,
} from '../types/review.type';
import prisma from '../utils/prismaClient.util';

export const reviewDetailInclude = Prisma.validator<Prisma.ReviewInclude>()({
  user: { select: { name: true } },
  product: { select: { name: true, price: true } },
  orderItem: {
    include: {
      size: true,
      order: { select: { createdAt: true } },
    },
  },
});

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
        order: {
          select: {
            userId: true,
            payments: {
              select: { status: true },
            },
          },
        },
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

  //상품 존재 확인
  checkProductExists: async (productId: string): Promise<boolean> => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    return !!product;
  },

  //상품 아이디로 리뷰 목록 조회
  findReviewsByProductId: async (
    productId: string,
    page: number,
    limit: number,
  ) => {
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { name: true } },
        },
        skip: (page - 1) * limit, // 오프셋 계산
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return { items, total };
  },

  //리뷰 상세조회
  findReviewDetailById: async (reviewId: string) => {
    return await prisma.review.findUnique({
      where: { id: reviewId },
      include: reviewDetailInclude,
    });
  },

  findById: async (reviewId: string) => {
    return await prisma.review.findUnique({ where: { id: reviewId } });
  },

  //리뷰 수정
  updateReview: async (id: string, data: UpdateReviewInput) => {
    return await prisma.review.update({
      where: { id },
      data,
    });
  },

  //리뷰 삭제
  deleteReview: async (reviewId: string) => {
    return await prisma.review.delete({
      where: { id: reviewId },
    });
  },
};
