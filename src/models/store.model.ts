import { Prisma, Store } from '@prisma/client';

export interface CreateStoreRepoDto {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string | null;
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

//스토어 생성 후 응답 DTO
export class StoreResponseDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Store) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.address = data.address;
    this.detailAddress = data.detailAddress;
    this.phoneNumber = data.phoneNumber;
    this.content = data.content;
    this.image = data.image || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

//스토어 상세 응답 DTO
export class StoreDetailResponseDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: StoreWithCount) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.address = data.address;
    this.detailAddress = data.detailAddress;
    this.phoneNumber = data.phoneNumber;
    this.content = data.content;
    this.image = data.image || '';
    this.favoriteCount = data._count?.favoritedBy ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

//내 스토어 상세 응답 DTO
export class MyStoreDetailResponseDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  image: string;
  content: string;
  productCount: number;
  favoriteCount: number;
  monthFavoriteCount: number;
  totalSoldCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: MyStoreData) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.address = data.address;
    this.detailAddress = data.detailAddress;
    this.phoneNumber = data.phoneNumber;
    this.image = data.image || '';
    this.content = data.content;
    this.productCount = data._count?.products ?? 0;
    this.favoriteCount = data._count?.favoritedBy ?? 0;
    this.monthFavoriteCount = data.monthFavoriteCount ?? 0;
    this.totalSoldCount = data.totalSoldCount ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
