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
import { TokenPayload } from '../utils/jwt.util';

export const login = async (
  data: LoginInput,
): Promise<{ response: LoginResponseDto; refreshToken: string }> => {
  // 1. DTO 변환 및 준비
  const dto = new LoginRequestDto(data);
  const email = dto.normalizeEmail();

  // 2. 유저 조회
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  // 3. 비밀번호 검증
  if (!user.password) {
    throw new InvalidCredentialsError();
  }
  const isPasswordValid = await comparePassword(dto.password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const accessToken = generateAccessToken(user.id, user.type);
  const refreshToken = generateRefreshToken(user.id, user.type);
  const authUser = new AuthUserResponseDto(user);

  const result = {
    response: new LoginResponseDto(authUser, accessToken),
    refreshToken
  };
  
  return result; 
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
  const payload = result.payload as TokenPayload;
  // 새 토큰 발급
  const userId = payload.userId;
  const type = payload.type;

  const newAccessToken = generateAccessToken(userId, type);
  const newRefreshToken = generateRefreshToken(userId, type);

  // Response DTO로 변환하여 반환
  return new AuthTokensResponseDto({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};
