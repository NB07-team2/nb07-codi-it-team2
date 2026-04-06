import { Request, Response } from 'express';
import { create } from 'superstruct';
import { CreateStoreStruct } from '../structs/store.struct';
import {
  createStoreService,
  getMyStore,
  getStoreDetail,
} from '../services/store.service';

//스토어 등록
export const createStoreController = async (req: Request, res: Response) => {
  // 유저 아이디와 권한 타입
  const { id: userId, type: userType } = req.user!;

  const validatedData = create(
    { ...req.body, image: req.file },
    CreateStoreStruct,
  );

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
export const storeDetail = async (
  req: Request<{ storeId: string }>,
  res: Response,
) => {
  const { storeId } = req.params;
  const result = await getStoreDetail(storeId);

  res.status(200).json(result);
};
