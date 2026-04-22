import { Prisma, ProductCategoryName } from '@prisma/client';
import prisma from '../utils/prismaClient.util';
import { CreateProductDTO } from '../structs/product.struct';
import { GetProductsQuery } from '../structs/product.struct';

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
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
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
    let orderBy:
      | Prisma.ProductOrderByWithRelationInput
      | Prisma.ProductOrderByWithRelationInput[] = { createdAt: 'desc' };

    if (sort === 'mostReviewed') orderBy = { reviews: { _count: 'desc' } };
    // highRating이 들어오면 DB에서는 최신순으로 데이터를 가져오고, 이후 서비스 레이어에서 메모리 정렬을 수행
    else if (sort === 'recent' || sort === 'highRating')
      orderBy = { createdAt: 'desc' };
    else if (sort === 'lowPrice') orderBy = { price: 'asc' };
    else if (sort === 'highPrice') orderBy = { price: 'desc' };
    else if (sort === 'salesRanking') orderBy = { sales: 'desc' };

    // 데이터 조회 및 전체 카운트
    const [list, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          store: true,
          category: true,
          stocks: { include: { size: true } },
          reviews: true,
          inquiries: {
            include: { reply: { include: { user: true } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { list, totalCount };
  },
};
