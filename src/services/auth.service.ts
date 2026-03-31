import {
  InvalidCredentialsError,
  InvalidRequestError,
  TokenExpiredError,
} from '../errors/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util';
import { comparePassword } from '../utils/password.util';
// 유저 기능 구현 때 사용 예정
import * as userRepository from '../repositories/user.repository';
import { LoginInput } from '../structs/auth.schema.struct';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
} from '../models/auth.request.model';
import {
  AuthTokensResponseDto,
  AuthUserResponseDto,
  LoginResponseDto,
} from '../models/auth.response.model';

export const login = async (
  data: LoginInput,
): Promise<{ response: LoginResponseDto; refreshToken: string }> => {
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

  return {
    response: new LoginResponseDto(authUser, accessToken),
    refreshToken: refreshToken,
  };
};
export const logout = async (userId: string): Promise<void> => {
  return;
};

export const refreshTokens = async (
  refreshToken: string,
): Promise<AuthTokensResponseDto> => {
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
