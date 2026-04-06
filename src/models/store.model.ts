import { Store } from '@prisma/client';
import { MyStoreData, StoreWithCount } from '../types/store.type';

//하이픈 붙여주는 헬퍼 함수
const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

//스토어 생성 후 응답 DTO
export class StoreResponseDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Store) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.address = data.address;
    this.detailAddress = data.detailAddress;
    this.phoneNumber = formatPhoneNumber(data.phoneNumber);
    this.content = data.content;
    this.image = data.image || '';
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
    this.phoneNumber = formatPhoneNumber(data.phoneNumber);
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
    this.phoneNumber = formatPhoneNumber(data.phoneNumber);
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
