import { Prisma } from '@prisma/client';

export interface CreateStoreRepoDto {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string;
}
//스토어 상세 응답 타입
export type StoreWithCount = Prisma.StoreGetPayload<{
  include: { _count: { select: { favoritedBy: true } } };
}>;

export type MyStoreBasePayload = Prisma.StoreGetPayload<{
  include: {
    _count: {
      select: { products: true; favoritedBy: true };
    };
  };
}>;

//통계 데이터 타입 정의
interface StoreStats {
  monthFavoriteCount: number;
  totalSoldCount: number;
}
//내 스토어 상세 응답 타입
export type MyStoreData = MyStoreBasePayload & StoreStats;
