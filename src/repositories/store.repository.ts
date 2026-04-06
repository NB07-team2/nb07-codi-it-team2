import {
  CreateStoreRepoDto,
  MyStoreBasePayload,
  MyStoreData,
  StoreWithCount,
  UpdateStoreRepoDto,
} from '../types/store.type';
import prisma from '../utils/prismaClient.util';

export const StoreRepository = {
  //특정 유저의 스토어가 이미 있는지 확인
  findByUserId: async (userId: string) => {
    return await prisma.store.findUnique({
      where: { userId },
    });
  },

  //특정 전화번호를 사용하는 스토어가 있는지 확인 (내가 쓰던 번호 제외)
  findByPhoneNumber: async (phoneNumber: string, excludeStoreId?: string) => {
    return await prisma.store.findFirst({
      where: {
        phoneNumber,
        NOT: excludeStoreId ? { id: excludeStoreId } : undefined,
      },
    });
  },

  // 스토어 등록
  createStore: async (userId: string, data: CreateStoreRepoDto) => {
    return await prisma.store.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  //내 스토어 상세조회
  getMyStoreDetail: async (userId: string): Promise<MyStoreData | null> => {
    // 기본 정보 및상품 수, 전체 즐겨찾기 수 조회
    const store = (await prisma.store.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            products: true,
            favoritedBy: true,
          },
        },
      },
    })) as MyStoreBasePayload | null;

    if (!store) return null;

    //이번달 1일이 언제인지 계산
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    //통계 데이터 계산 (이번 달 즐겨찾기 & 총 판매량)
    const [monthFavoriteCount, salesAggregate] = await Promise.all([
      // 이번 달 즐겨찾기 수
      prisma.favorite.count({
        where: {
          storeId: store.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      // 모든 상품의 sales 필드 합계
      prisma.product.aggregate({
        where: { storeId: store.id },
        _sum: { sales: true },
      }),
    ]);

    return {
      ...store,
      monthFavoriteCount,
      totalSoldCount: salesAggregate._sum.sales || 0,
    } as MyStoreData;
  },

  //스토어 상세조회
  getStoreDetail: async (storeId: string): Promise<StoreWithCount | null> => {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        _count: {
          select: { favoritedBy: true },
        },
      },
    });
    return store;
  },
  findById: async (storeId: string) => {
    return await prisma.store.findUnique({
      where: { id: storeId },
    });
  },
  //스토어 수정
  updateStore: async (id: string, data: UpdateStoreRepoDto) => {
    return await prisma.store.update({
      where: { id },
      data,
    });
  },
};
