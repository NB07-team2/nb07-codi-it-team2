import { createProductRepoInput } from '../types/products';
import prisma from '../utils/prismaClient.util';

export const ProductRepository = {
  createProduct: async (input: createProductRepoInput) => {
    const { stocks = [], ...productData } = input;

    return prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: productData,
      });

      if (stocks.length > 0) {
        await tx.stock.createMany({
          data: stocks.map((stock) => ({
            productId: created.id,
            sizeId: stock.sizeId,
            quantity: stock.quantity,
          })),
        });
      }

      const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

      await tx.product.update({
        where: { id: created.id },
        data: { isSoldOut: totalStock === 0 },
      });

      return tx.product.findUnique({
        where: { id: created.id },
        include: {
          store: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          stocks: {
            include: {
              size: { select: { id: true, name: true } },
            },
            orderBy: [{ sizeId: 'asc' }],
          },
          inquiries: {
            include: {
              reply: {
                include: {
                  user: { select: { id: true, name: true } },
                },
              },
            },
            orderBy: [{ createdAt: 'desc' }],
          },
        },
      });
    });
  },
//사용할시 주석해제 사용 안할지 주석삭제 
  // findDetailById: async (productId: string) => {
  //   return prisma.product.findUnique({
  //     where: { id: productId },
  //     include: {
  //       store: { select: { id: true, name: true } },
  //       category: { select: { id: true, name: true } },
  //       stocks: {
  //         include: {
  //           size: { select: { id: true, name: true } },
  //         },
  //         orderBy: [{ sizeId: 'asc' }],
  //       },
  //       inquiries: {
  //         include: {
  //           reply: {
  //             include: {
  //               user: { select: { id: true, name: true } },
  //             },
  //           },
  //         },
  //         orderBy: [{ createdAt: 'desc' }],
  //       },
  //     },
  //   });
  // },

  // findReviewSummaryByProductId: async (productId: string) => {
  //   return prisma.review.groupBy({
  //     by: ['rating'],
  //     where: { productId },
  //     _count: { rating: true },
  //     _sum: { rating: true },
  //   });
  // },
};
