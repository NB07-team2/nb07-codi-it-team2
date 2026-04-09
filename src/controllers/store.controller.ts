import { Request, Response } from 'express';
import { create } from 'superstruct';
import {
  GetStoreProductListStruct,
  StoreIdStruct,
  StoreStruct,
} from '../structs/store.struct';
import {
  createStoreService,
  editStore,
  favoriteStoreDelete,
  favoriteStoreRegister,
  getMyStore,
  getStoreDetail,
  myStoreProducts,
} from '../services/store.service';
import { BadRequestError } from '../errors/errors';

//스토어 등록
export const createStoreController = async (req: Request, res: Response) => {
  // 유저 아이디와 권한 타입
  const { id: userId, type: userType } = req.user!;

  if (req.body.image && !req.file) {
    throw new BadRequestError('이미지는 파일 형태로만 업로드 가능합니다.');
  }

  const dataToValidate = {
    ...req.body,
    image: req.file,
  };

  const validatedData = create(dataToValidate, StoreStruct);

  const result = await createStoreService(
    userId,
    userType,
    validatedData,
    req.file,
  );

  res.status(201).json(result);
};

//내 스토어 상세조회
export const getMyStoreController = async (req: Request, res: Response) => {
  const { id: userId, type: userType } = req.user!;

  const myStoreDetail = await getMyStore(userId, userType);

  res.status(200).json(myStoreDetail);
};

//스토어 상세조회
export const storeDetail = async (req: Request, res: Response) => {
  const { storeId } = create(req.params, StoreIdStruct);
  const result = await getStoreDetail(storeId);

  res.status(200).json(result);
};

//스토어 수정
export const updateStore = async (req: Request, res: Response) => {
  const { id: userId, type: userType } = req.user!;
  const { storeId } = create(req.params, StoreIdStruct);

  if (req.body.image && !req.file) {
    throw new BadRequestError('이미지는 파일 형태로만 업로드 가능합니다.');
  }

  const dataToValidate = {
    ...req.body,
    image: req.file,
  };

  const validatedData = create(dataToValidate, StoreStruct);

  const result = await editStore(
    userId,
    userType,
    storeId,
    validatedData,
    req.file,
  );

  res.status(200).json(result);
};

//내 스토어 등록 상품 조회
export const getMyStoreProducts = async (req: Request, res: Response) => {
  const validatedParams = create(req.query, GetStoreProductListStruct);
  const { id: userId, type: userType } = req.user!;

  const result = await myStoreProducts({
    ...validatedParams,
    userId,
    userType,
  });
  res.status(200).json(result);
};

//관심 스토어 등록
export const registerFavoriteStore = async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { storeId } = create(req.params, StoreIdStruct);

  const result = await favoriteStoreRegister(userId, storeId);
  res.status(201).json(result);
};

//관심 스토어 해제
export const deleteFavoriteStore = async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { storeId } = create(req.params, StoreIdStruct);

  const result = await favoriteStoreDelete(userId, storeId);
  res.status(200).json(result);
};
