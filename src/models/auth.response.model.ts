import { GradeResponse, UserResponse } from '../types/auth.type';

// 회원 정보 응답 DTO
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  type: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  grade: GradeResponse;
  image: string;

  constructor(user: UserResponse) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.points = user.points;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.grade = {
      id: user.grade.id,
      name: user.grade.name,
      rate: user.grade.rate,
      minAmount: user.grade.minAmount,
    };
    this.image = user.image;
  }
}

// 인증 관련 응답 DTO
export class AuthUserResponseDto implements Omit<UserResponse, 'points'> {
  id: string;
  name: string;
  email: string;
  type: string;
  points: string;
  createdAt: Date;
  updatedAt: Date;
  grade: GradeResponse;
  image: string;

  constructor(user: UserResponse) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.points = user.points.toString();
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.grade = user.grade;
    this.image = user.image;
  }
}

// 로그인 응답 DTO
export class LoginResponseDto {
  user: AuthUserResponseDto;
  accessToken: string;

  constructor(user: AuthUserResponseDto, accessToken: string) {
    this.user = user;
    this.accessToken = accessToken;
  }
}

// 토큰 갱신 응답 DTO
export class RefreshTokenResponseDto {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}

// 인증 토큰 응답 DTO
export class AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;

  constructor(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}
