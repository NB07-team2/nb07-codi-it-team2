import * as userRepository from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { UpdateMeDto, UserResponse, UserWithGrade } from '../types/user.type';
import { ConflictError, NotFoundError, InvalidCredentialsError } from '../errors/errors';
import { Prisma } from '@prisma/client';

// 회원가입
export const register = async (data: any) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) throw new ConflictError('이미 존재하는 유저입니다.');

  const hashedPassword = await hashPassword(data.password);
  const newUser = await userRepository.create({
    ...data,
    password: hashedPassword,
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
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');
  
  // 보안을 위해 비밀번호는 제외하고 반환 (명세서 기준)
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// 내 정보 수정 (비밀번호 2차 검증 포함)
export const updateMe = async (
  userId: string, 
  updateData: UpdateMeDto
): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

  const isPasswordValid = await comparePassword(updateData.currentPassword, user.password);
  if (!isPasswordValid) throw new InvalidCredentialsError();

  const data: Prisma.UserUpdateInput = {}; 
  if (updateData.name) data.name = updateData.name;
  if (updateData.image) data.image = updateData.image;
  if (updateData.password) {
    data.password = await hashPassword(updateData.password);
  }

  const updatedUser: UserWithGrade = await userRepository.update(userId, data);

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
  if (!userExists) throw new NotFoundError('존재하지 않는 유저입니다.');

  return await userRepository.findFavoritesByUserId(userId);
};

// 회원 탈퇴
export const deleteMe = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

  return await userRepository.deleteUser(userId);
};