import { Prisma, ProductCategoryName } from '@prisma/client';
import prisma from '../utils/prismaClient.util';
import {
  CreateProductDTO,
  GetProductsQuery,
  UpdateProductDTO,
} from '../structs/product.struct';

export const ProductRepository = {
  // 같은 스토어 내 중복 상품 이름 확인
  findByNameInStore: async (storeId: string, name: string) => {
    return await prisma.product.findFirst({
      where: { storeId, name },
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

  // 상품 목록 조회
  findAll: async (query: GetProductsQuery) => {
    const {
      page,
      pageSize,
      search,
      sort,
      priceMin,
      priceMax,
      size,
      categoryName,
      favoriteStore,
    } = query;

    // 조건이 참일 때만 객체에 속성 추가
    const where: Prisma.ProductWhereInput = {
      ...(search && {
        // 상품명 또는 스토어명에 검색어 포함 여부
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { store: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(categoryName && {
        category: { name: categoryName as ProductCategoryName },
      }),
      ...(favoriteStore && { storeId: favoriteStore }),
      ...((priceMin !== undefined || priceMax !== undefined) && {
        price: {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax }),
        },
      }),
      ...(size && {
        stocks: {
          some: {
            size: { name: size },
            quantity: { gt: 0 },
          },
        },
      }),
    };

    // 정렬 조건 구성
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    if (sort === 'mostReviewed') orderBy = { reviews: { _count: 'desc' } };
    else if (sort === 'recent') orderBy = { createdAt: 'desc' };
    else if (sort === 'lowPrice') orderBy = { price: 'asc' };
    else if (sort === 'highPrice') orderBy = { price: 'desc' };
    else if (sort === 'salesRanking') orderBy = { sales: 'desc' };

    const isHighRating = sort === 'highRating';

    // 데이터 조회 및 전체 카운트
    const [list, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        // highRating이 아닐 때만 DB에서 페이징 처리
        ...(isHighRating
          ? {}
          : { skip: (page - 1) * pageSize, take: pageSize }),
        include: {
          store: true,
          stocks: { include: { size: true } },
          reviews: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { list, totalCount };
  },

  // 상품 상세 조회
  findById: async (productId: string) => {
    return await prisma.product.findUnique({
      where: { id: productId },
    });
  },
  // 상품 수정
  update: async (
    tx: Prisma.TransactionClient,
    productId: string,
    updateData: UpdateProductDTO & { categoryId?: string; image?: string },
    stocksMap?: { sizeId: number; quantity: number }[],
  ) => {
    // 업데이트할 데이터만 추출
    const data: Prisma.ProductUpdateInput = {};
    if (updateData.name) data.name = updateData.name;
    if (updateData.content !== undefined) data.content = updateData.content;
    if (updateData.price !== undefined) data.price = updateData.price;
    if (updateData.categoryId) {
      data.category = { connect: { id: updateData.categoryId } };
    }
    if (updateData.image) data.image = updateData.image;
    if (updateData.discountRate !== undefined)
      data.discountRate = updateData.discountRate;

    if (updateData.discountStartTime !== undefined) {
      data.discountStartTime = updateData.discountStartTime
        ? new Date(updateData.discountStartTime)
        : null;
    }
    if (updateData.discountEndTime !== undefined) {
      data.discountEndTime = updateData.discountEndTime
        ? new Date(updateData.discountEndTime)
        : null;
    }

    // 재고 변경
    if (stocksMap) {
      data.stocks = {
        upsert: stocksMap.map((s) => ({
          where: {
            productId_sizeId: {
              productId: productId,
              sizeId: s.sizeId,
            },
          },
          // 이미 있으면 수량만 업데이트
          update: {
            quantity: s.quantity,
          },
          // 없으면 새로 생성
          create: {
            sizeId: s.sizeId,
            quantity: s.quantity,
          },
        })),
      };
    }

    return await tx.product.update({
      where: { id: productId },
      data,
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

  // 상품 삭제
  delete: async (productId: string) => {
    return await prisma.$transaction(async (tx) => {
      // 문의에 달린 답변들을 먼저 삭제
      await tx.reply.deleteMany({
        where: {
          inquiry: {
            productId: productId,
          },
        },
      });

      // 문의 삭제
      await tx.inquiry.deleteMany({
        where: { productId },
      });

      // 재고 데이터 삭제
      await tx.stock.deleteMany({
        where: { productId },
      });

      // 장바구니 아이템 삭제
      await tx.cartItem.deleteMany({ where: { productId } });
      return await tx.product.delete({
        where: { id: productId },
      });
    });
  },
};
