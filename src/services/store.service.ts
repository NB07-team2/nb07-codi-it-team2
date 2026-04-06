import { ConflictError, ForbiddenError, NotFoundError } from '../errors/errors';
import {
  MyStoreDetailResponseDto,
  StoreDetailResponseDto,
  StoreResponseDto,
} from '../models/store.model';
import { StoreRepository } from '../repositories/store.repository';
import { CreateStoreRequest } from '../structs/store.struct';
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
  userType: string,
  data: CreateStoreRequest,
  file?: Express.Multer.File,
) {
  //판매자 여부 재확인
  if (userType !== 'SELLER') throw new ForbiddenError('판매자만 가능합니다.');
  //1인 1스토어
  const userStore = await StoreRepository.findByUserId(userId);
  if (userStore) throw new ConflictError('스토어가 이미 존재합니다.');
  //전화번호 중복 확인
  const normalizedPhone = data.phoneNumber.replace(/-/g, ''); //중복 확인시에는 하이픈 제거
  await validatePhoneNumber(normalizedPhone);

  //이미지 업로드 처리
  let imageUrlString = null;
  if (file) {
    const uploadResult = await imageService.uploadImage(file);
    imageUrlString = uploadResult.url;
  }
  const newStore = await StoreRepository.createStore(userId, {
    ...data,
    image: imageUrlString,
  });

  return new StoreResponseDto(newStore);
}

//내 스토어 상세 조회
export const getMyStore = async (userId: string, userType: string) => {
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
