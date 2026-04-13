import {
  InvalidCredentialsError,
  InvalidRequestError,
  NotFoundError,
  TokenExpiredError,
} from '../errors/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util';
import { comparePassword } from '../utils/password.util';
import * as userRepository from '../repositories/user.repository';
import { LoginInput } from '../structs/auth.struct';
import { LoginRequestDto, RefreshTokenRequestDto } from '../models/auth.model';
import {
  AuthTokensResponseDto,
  AuthUserResponseDto,
  LoginResponseDto,
} from '../models/auth.model';
import { TokenPayload } from '../types/jwt.type';

export const login = async (
  data: LoginInput,
): Promise<{ response: LoginResponseDto; refreshToken: string }> => {
  const dto = new LoginRequestDto(data);
  const email = dto.normalizeEmail();
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError();
  }

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
    refreshToken,
  };

  return result;
};

export const logout = async (userId: string): Promise<void> => {
  return;
};

export const refreshTokens = async (
  refreshToken: string,
): Promise<AuthTokensResponseDto> => {
  const dto = new RefreshTokenRequestDto(refreshToken);
  const result = verifyRefreshToken(dto.refreshToken);

  if (!result.valid) {
    if (result.expired) {
      throw new TokenExpiredError();
    }
    throw new InvalidRequestError();
  }

  const payload = result.payload as TokenPayload;
  const userId = payload.userId;
  const type = payload.type;

  const newAccessToken = generateAccessToken(userId, type);
  const newRefreshToken = generateRefreshToken(userId, type);

  return new AuthTokensResponseDto({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};
