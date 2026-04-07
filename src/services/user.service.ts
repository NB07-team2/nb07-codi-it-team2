import * as userRepository from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  UpdateMeDto,
  UserWithGrade,
  RegisterUserDto,
} from '../types/user.type';
import { UserResponseDto } from '../models/user.model';
import {
  ConflictError,
  NotFoundError,
  InvalidCredentialsError,
} from '../errors/errors';
import { Prisma } from '@prisma/client';
import { deleteFromS3 } from '../services/image.service';

// 회원가입
export const register = async (data: RegisterUserDto) => {
  const existingUser = await userRepository.findByEmail(data.email);

  if (existingUser) throw new ConflictError('이미 존재하는 유저입니다.');

  const hashedPassword = await hashPassword(data.password);
  const newUser = await userRepository.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    type: data.type,
    ...(data.image && { image: data.image }),
  });

  return new UserResponseDto(newUser);
};

// 내 정보 조회
export const getMe = async (userId: string) => {
  const newUser = await userRepository.findById(userId);

  if (!newUser) throw new NotFoundError('유저를 찾을 수 없습니다.');

  return new UserResponseDto(newUser);
};

// 내 정보 수정
export const updateMe = async (
  userId: string,
  updateData: UpdateMeDto,
): Promise<UserResponseDto> => {
  const user = await userRepository.findById(userId);

  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

  const isPasswordValid = await comparePassword(
    updateData.currentPassword,
    user.password,
  );

  if (!isPasswordValid) throw new InvalidCredentialsError();

  const data: Prisma.UserUpdateInput = {};

  if (updateData.name) data.name = updateData.name;
  if (updateData.image) {
    const DEFAULT_IMAGE =
      'https://codi-it-s3.s3.amazonaws.com/others/b7220551-54e3-414f-bed1-801a44e71d45.png';

    if (
      user.image &&
      user.image !== DEFAULT_IMAGE &&
      user.image !== updateData.image
    ) {
      await deleteFromS3(user.image);
      console.log(`기존 커스텀 이미지 S3 삭제 완료: ${user.image}`);
    }
    data.image = updateData.image;
  }

  if (updateData.password) {
    data.password = await hashPassword(updateData.password);
  }

  const updatedUser: UserWithGrade = await userRepository.update(userId, data);

  return new UserResponseDto(updatedUser);
};

// 관심 스토어 조회
export const getFavorites = async (userId: string) => {
  const userExists = await userRepository.findById(userId);

  if (!userExists) throw new NotFoundError('유저를 찾을 수 없습니다.');

  const favorites = await userRepository.findFavoritesByUserId(userId);

  return favorites.map((fav) => ({
    storeId: fav.storeId,
    userId: fav.userId,
    store: { ...fav.store },
  }));
};

// 회원 탈퇴
export const deleteMe = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

  const DEFAULT_IMAGE =
    'https://codi-it-s3.s3.amazonaws.com/others/b7220551-54e3-414f-bed1-801a44e71d45.png';

  // 기본 이미지가 아닐 때만 S3에서 삭제
  if (user.image && user.image !== DEFAULT_IMAGE) {
    try {
      await deleteFromS3(user.image);
      console.log(`S3 이미지 삭제 완료: ${user.image}`);
    } catch (error) {
      console.error('S3 이미지 삭제 중 오류 발생:', error);
    }
  }
  return await userRepository.deleteUser(userId);
};

/**
 * 주문 완료 후 유저의 누적 금액, 등급, 포인트를 업데이트하는 로직
 * @param userId 업데이트할 유저 ID
 * @param paymentAmount 이번에 결제한 금액
 */
// export const updateUserStatusAfterOrder = async (
//   userId: string,
//   paymentAmount: number,
// ) => {
//   // 유저 및 등급 정보 조회
//   const user = await userRepository.findById(userId);
//   if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

//   // 누적 금액 계산
//   const newTotalPurchase = user.totalPurchase + paymentAmount;

//   // 승급 되는지 체크 (Grade 테이블 조회 로직 필요)
//   // TODO: Grade 테이블의 minAmount와 비교하여 등급 상향 로직 추가 예정
//   let newGradeId = user.gradeId;

//   // 포인트 계산
//   // 현재 등급의 rate를 가져와서 포인트 적립액 계산 (창민님과 논의 예정)
//   const earnedPoints = Math.floor(paymentAmount * (user.grade.rate / 100));
//   const newPoints = user.points + earnedPoints;

//   return await userRepository.update(userId, {
//     totalPurchase: newTotalPurchase,
//     points: newPoints,
//     gradeId: newGradeId,
//   });
// };
