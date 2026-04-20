import { UserType } from '@prisma/client';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors/errors';
import {
  FavoriteStoreResponseDto,
  MyStoreDetailResponseDto,
  MyStoreProductItemDto,
  StoreDetailResponseDto,
  StoreResponseDto,
} from '../models/store.model';
import { StoreRepository } from '../repositories/store.repository';
import {
  CreateStoreRequest,
  MyStoreProductsServiceParams,
  UpdateStoreRequest,
} from '../types/store.type';
import * as imageService from './image.service';

//전화번호 중복 확인
async function validatePhoneNumber(
  phoneNumber: string,
  excludeStoreId?: string,
) {
  const existing = await StoreRepository.findByPhoneNumber(
    phoneNumber,
    excludeStoreId,
  );
  if (existing) {
    throw new ConflictError('이미 등록된 전화번호입니다');
  }
}

//스토어 등록
export async function createStoreService(
  userId: string,
  userType: UserType,
  data: CreateStoreRequest,
  file?: Express.Multer.File,
) {
  //판매자 여부 재확인
  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자 권한이 필요합니다.');
  //1인 1스토어
  const userStore = await StoreRepository.findByUserId(userId);
  if (userStore) throw new ConflictError('스토어가 이미 존재합니다.');

  //전화번호 중복 확인 (현재 내 스토어 ID는 제외하고 검색)
  const normalizedPhone = data.phoneNumber.replace(/-/g, ''); //중복 확인시과 db 저장시에는 하이픈 제거
  await validatePhoneNumber(normalizedPhone);

  //이미지 업로드 처리
  let imageUrlString = '';
  if (file) {
    const uploadResult = await imageService.uploadImage(file);
    imageUrlString = uploadResult.url;
  }
  const newStore = await StoreRepository.createStore(userId, {
    ...data,
    phoneNumber: normalizedPhone,
    image: imageUrlString,
  });

  return new StoreResponseDto(newStore);
}

//내 스토어 상세 조회
export const getMyStore = async (userId: string, userType: UserType) => {
  //판매자 여부 재확인
  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자 권한이 필요합니다.');

  const store = await StoreRepository.getMyStoreDetail(userId);
  if (!store) throw new NotFoundError('존재하지 않는 스토어 입니다.');

  return new MyStoreDetailResponseDto(store);
};

//스토어 상세조회
export const getStoreDetail = async (storeId: string) => {
  const store = await StoreRepository.getStoreDetail(storeId);

  if (!store) {
    throw new NotFoundError('존재하지 않는 스토어 입니다.');
  }
  return new StoreDetailResponseDto(store);
};

//스토어 수정
export const editStore = async (
  userId: string,
  userType: UserType,
  storeId: string,
  data: UpdateStoreRequest,
  file?: Express.Multer.File,
) => {
  //판매자 여부 재확인
  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자 권한이 필요합니다.');

  const store = await StoreRepository.findByStoreId(storeId);
  if (!store) throw new NotFoundError('존재하지 않는 스토어입니다.');
  if (store.userId !== userId)
    throw new ForbiddenError('본인의 스토어만 수정할 수 있습니다.');

  //전화번호 중복 확인 (현재 내 스토어 ID는 제외하고 검색)
  const normalizedPhone = data.phoneNumber.replace(/-/g, '');
  await validatePhoneNumber(normalizedPhone, storeId);

  //이미지 처리 로직
  let imageUrlString = store.image || '';

  if (file) {
    // 새 파일이 업로드된 경우
    const uploadResult = await imageService.uploadImage(file);
    imageUrlString = uploadResult.url;

    // 기존 S3 파일 삭제 (기존 이미지가 있었을 경우만)
    if (store.image) {
      await imageService.deleteFromS3(store.image);
    }
  }

  const updatedStore = await StoreRepository.updateStore(storeId, {
    ...data,
    phoneNumber: normalizedPhone,
    image: imageUrlString,
  });

  return new StoreResponseDto(updatedStore);
};

//내 스토어 등록 상품 조회
export const myStoreProducts = async (params: MyStoreProductsServiceParams) => {
  const { page, pageSize, userId, userType } = params;

  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자 권한이 필요합니다.');

  const store = await StoreRepository.findByUserId(userId);
  if (!store) {
    throw new NotFoundError('존재하지 않는 스토어입니다.');
  }

  const { totalCount, list } = await StoreRepository.findMyStoreProducts({
    storeId: store.id,
    page,
    pageSize,
  });

  return {
    list: list.map((product) => new MyStoreProductItemDto(product)),
    totalCount,
  };
};

//관심 스토어 등록
export const favoriteStoreRegister = async (
  userId: string,
  storeId: string,
) => {
  const store = await StoreRepository.findByStoreId(storeId);
  if (!store) throw new NotFoundError('존재하지 않는 스토어입니다.');
  // 본인 스토어 여부 확인
  if (store.userId === userId)
    throw new ForbiddenError(
      '본인의 스토어를 등록할 수 없습니다.잘못된 요청입니다.(store)',
    );
  //관심 스토어 중복 확인
  const existingFavorite = await StoreRepository.findFavorite(userId, storeId);
  if (existingFavorite) {
    throw new ConflictError('이미 관심 스토어로 등록되어 있습니다.');
  }
  const addFavorite = await StoreRepository.favoriteStoreRegister(
    userId,
    storeId,
  );
  return new FavoriteStoreResponseDto('register', addFavorite.store);
};

//관심 스토어 해제
export const favoriteStoreDelete = async (userId: string, storeId: string) => {
  const store = await StoreRepository.findByStoreId(storeId);
  if (!store) throw new NotFoundError('존재하지 않는 스토어입니다.');
  //관심 스토어 존재 확인
  const favorite = await StoreRepository.findFavorite(userId, storeId);
  if (!favorite) {
    throw new NotFoundError('관심 스토어로 등록되어 있지 않습니다.');
  }
  const favoriteClear = await StoreRepository.favoriteStoreDelete(
    userId,
    storeId,
  );
  return new FavoriteStoreResponseDto('delete', favoriteClear.store);
};
