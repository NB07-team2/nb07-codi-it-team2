import { Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient.util';
import { CreateProductDTO } from '../structs/product.struct';

export const ProductRepository = {
  // 같은 스토어 내 중복 상품 이름 확인
  findByNameInStore: async (storeId: string, name: string) => {
    return await prisma.product.findFirst({
      where: { storeId, name },
    });
  },

  // 상품 상세 조회 - 수정/삭제 시 권한 확인용으로도 사용
  findById: async (productId: string) => {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: true,
        category: true,
        stocks: { include: { size: true } },
        inquiries: {
          include: { reply: { include: { user: true } } },
        },
        reviews: true,
      },
    });
  },

  // 상품 생성
  create: async (
    tx: Prisma.TransactionClient,
    storeId: string,
    categoryId: string,
    imageUrl: string,
    data: CreateProductDTO,
  ) => {
    return await tx.product.create({
      data: {
        name: data.name,
        price: data.price,
        content: data.content,
        image: imageUrl,
        discountRate: data.discountRate || 0,
        discountStartTime: data.discountStartTime
          ? new Date(data.discountStartTime)
          : null,
        discountEndTime: data.discountEndTime
          ? new Date(data.discountEndTime)
          : null,
        storeId: storeId,
        categoryId: categoryId,
        stocks: {
          create: data.stocks.map((item) => ({
            sizeId: item.sizeId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        store: true,
        category: true,
        stocks: { include: { size: true } },
        inquiries: {
          include: { reply: { include: { user: true } } },
        },
        reviews: true,
      },
    });
  },
};
