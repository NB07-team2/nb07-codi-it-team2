import { env } from '../utils/env.js';
import {
  ConflictError,
  InvalidCredentialsError,
  InvalidRequestError,
  TokenExpiredError,
} from '../errors/errors.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import * as userRepository from '../repositories/user.repository.js';
import { LoginInput, RegisterInput } from '../models/auth.schema.js';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
} from '../models/auth.request.dto.js';
import {
  UserResponseDto,
  AuthTokensResponseDto,
  AuthUserResponseDto,
  LoginResponseDto,
} from '../models/auth.response.dto.js';

export const login = async (data: LoginInput): Promise<{response: LoginResponseDto; refreshToken: string}> => {
  // DTO로 변환
  const dto = new LoginRequestDto(data);

  // 유저 조회
  const user = await userRepository.findByEmail(dto.normalizeEmail());
  if (!user) {
    throw new InvalidCredentialsError();
  }

  // 비밀번호 검증
  if (!user.password) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await comparePassword(dto.password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  // 토큰 발급
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  // 명세서에 맞춘 User 정보 포함 (points를 string 변환 DTO 사용)
  const authUser = new AuthUserResponseDto(user);

  return{ response: new LoginResponseDto(
    authUser,
    accessToken,
  ),
  refreshToken: refreshToken
};
};
export const logout = async (userId: string): Promise<void> => {
  return;
};

export const refreshTokens = async (refreshToken: string): Promise<AuthTokensResponseDto> => {
  // DTO로 변환
  const dto = new RefreshTokenRequestDto(refreshToken);

  // 토큰 검증
  const result = verifyRefreshToken(dto.refreshToken);

  if (!result.valid) {
    if (result.expired) {
      throw new TokenExpiredError();
    }
    throw new InvalidRequestError();
  }

  // 새 토큰 발급
  const userId = result.payload!.userId;
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  // Response DTO로 변환하여 반환
  return new AuthTokensResponseDto({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};