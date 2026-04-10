import { Prisma } from '@prisma/client';
import {
  GetStoreProductListStruct,
  StoreStruct,
} from '../structs/store.struct';
import { Infer } from 'superstruct';

// Multer 파일 객체의 최소 규격 정의
export interface MulterFileObject {
  originalname: string;
  mimetype: string;
  buffer?: Buffer;
  path?: string;
}

//스토어 생성 요청 타입
export type CreateStoreRequest = Infer<typeof StoreStruct>;

//스토어 생성 응답 타입
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

// 스토어 수정 요청을 위한 리포지토리 DTO (rep)
export interface UpdateStoreRepoDto {
  name?: string;
  address?: string;
  detailAddress?: string;
  phoneNumber?: string;
  content?: string;
  image?: string;
}

//스토어 수정 요청 타입
export type UpdateStoreRequest = {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image?: any;
};

//내 스토어 상품 목록 조회 DTO용 타입
export type ProductWithStockQuantity = Prisma.ProductGetPayload<{
  include: {
    stocks: {
      select: {
        quantity: true;
      };
    };
  };
}>;

//페이지네이션 타입
export type PaginationParams = Infer<typeof GetStoreProductListStruct>;

//서비스 로직용 파라미터 타입 (페이지네이션 확장)
export interface MyStoreProductsServiceParams extends PaginationParams {
  userId: string;
  userType: string;
}

//리포지토리용 파라미터 타입
export interface FindMyStoreProductsRepoParams extends PaginationParams {
  storeId: string;
}

//관심 스토어 타입
export type FavoriteResponseType = 'register' | 'delete';
