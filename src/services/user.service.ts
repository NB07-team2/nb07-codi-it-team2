import * as userRepository from '../repositories/user.repository';
import { hashPassword, 
  comparePassword } from '../utils/password.util';
import { 
  UpdateMeDto, 
  UserResponse, 
  UserWithGrade, 
  RegisterUserDto } from '../types/user.type';
import { ConflictError, 
  NotFoundError, 
  InvalidCredentialsError } from '../errors/errors';
import { Prisma } from '@prisma/client';
import { deleteFromS3 } from '../services/image.service';

// 회원가입
export const register = async (data: RegisterUserDto) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) 
    throw new ConflictError('이미 존재하는 유저입니다.');

  const hashedPassword = await hashPassword(data.password);
  const newUser = await userRepository.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    type: data.type, 
    // undefined( 프로필 미지정 )일 경우 스키마의 @default 값이 입력됩니다.
    image: data.image || undefined, 
    points: 0, 
    gradeId: 'grade_green', 
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    type: newUser.type,
    points: newUser.points,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
    grade: {
      name: newUser.grade.name, 
      id: newUser.grade.id,
      rate: newUser.grade.rate,
      minAmount: newUser.grade.minAmount
    },
    image: newUser.image
  };
};

// 내 정보 조회
export const getMe = async (userId: string) => {
  const newUser = await userRepository.findById(userId);
  if (!newUser) throw new NotFoundError('유저를 찾을 수 없습니다.');
  
  // 명세서 규격 일치화
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    type: newUser.type,
    points: newUser.points,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
    grade: {
      name: newUser.grade.name,
      id: newUser.grade.id,
      rate: newUser.grade.rate,
      minAmount: newUser.grade.minAmount,
    },
    image: newUser.image,
  };
};

// 내 정보 수정 (비밀번호 2차 검증 포함)
export const updateMe = async (
  userId: string, 
  updateData: UpdateMeDto
): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) 
    throw new NotFoundError('유저를 찾을 수 없습니다.');

  const isPasswordValid = await comparePassword(updateData.currentPassword, user.password);
  if (!isPasswordValid) 
    throw new InvalidCredentialsError();

  const data: Prisma.UserUpdateInput = {}; 
  if (updateData.name) 
    data.name = updateData.name;
  if (updateData.image) {
    // ★ 기본값 이미지 URL 변경 필요
    const DEFAULT_IMAGE = "https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png";

    // 기존에 이미지가 있었고, 기본 이미지가 아니며, 새 이미지와 주소가 다를 때만 삭제 => 주석 삭제 예정
    // Garbage Collection 방지
    if (user.image && user.image !== DEFAULT_IMAGE && user.image !== updateData.image) {
      await deleteFromS3(user.image);
      console.log(`기존 커스텀 이미지 S3 삭제 완료: ${user.image}`);
    }
    data.image = updateData.image;
  }
    
  if (updateData.password) {
    data.password = await hashPassword(updateData.password);
  }

  const updatedUser: UserWithGrade = await userRepository.update(userId, data);

  // 명세서 규격 일치화
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    type: updatedUser.type,
    points: updatedUser.points,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    grade: {
      name: updatedUser.grade.name,
      id: updatedUser.grade.id,
      rate: updatedUser.grade.rate,
      minAmount: updatedUser.grade.minAmount
    },
    image: updatedUser.image
  };
};

// 관심 스토어 조회
export const getFavorites = async (userId: string) => {
  const userExists = await userRepository.findById(userId);
  if (!userExists) 
    throw new NotFoundError('유저를 찾을 수 없습니다.');

  const favorites = await userRepository.findFavoritesByUserId(userId);

  // 명세서 규격 일치화
  return favorites.map((fav) => ({
    storeId: fav.storeId,
    userId: fav.userId,
    store: {
      id: fav.store.id,
      name: fav.store.name,
      createdAt: fav.store.createdAt,
      updatedAt: fav.store.updatedAt,
      userId: fav.store.userId,
      address: fav.store.address,
      detailAddress: fav.store.detailAddress,
      phoneNumber: fav.store.phoneNumber,
      content: fav.store.content,
      image: fav.store.image,
    },
  }));
};

// 회원 탈퇴
export const deleteMe = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) 
    throw new NotFoundError('유저를 찾을 수 없습니다.');

  // S3 설정 후 URL 변경 필요
  const DEFAULT_IMAGE = "https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png";

  // 기본 이미지가 아닐 때만 S3 삭제 시도
  if (user.image && user.image !== DEFAULT_IMAGE) {
    try {
      await deleteFromS3(user.image); 
      console.log(`S3 이미지 삭제 완료: ${user.image}`);
    } catch (error) {
      // 이미지 삭제 실패가 회원 탈퇴 전체를 막으면 안 되므로 에러 로깅만 합니다 => AWS 연결 후 주석 삭제 예정
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
export const updateUserStatusAfterOrder = async (userId: string, paymentAmount: number) => {
  // 유저 및 등급 정보 조회
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

  // 누적 금액 계산
  const newTotalPurchase = user.totalPurchase + paymentAmount;

  // 승급 되는지 체크 (Grade 테이블 조회 로직 필요)
  // TODO: Grade 테이블의 minAmount와 비교하여 등급 상향 로직 추가 예정
  let newGradeId = user.gradeId; 
  
  // 포인트 계산
  // TODO: 현재 등급의 rate를 가져와서 포인트 적립액 계산 (창민님과 논의 예정)
  const earnedPoints = Math.floor(paymentAmount * (user.grade.rate / 100));
  const newPoints = user.points + earnedPoints;

  // DB 업데이트
  return await userRepository.update(userId, {
    totalPurchase: newTotalPurchase,
    points: newPoints,
    gradeId: newGradeId,
  });
};