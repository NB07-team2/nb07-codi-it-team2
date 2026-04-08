import { GradeResponse, UserResponse } from '../types/auth.type';

// 회원가입 요청 DTO
export class RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  type: string;

  constructor(data: {
    email: string;
    password: string;
    name: string;
    type: string;
  }) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.type = data.type;
  }

  normalizeEmail(): string {
    return this.email.toLowerCase().trim();
  }
}

// 로그인 요청 DTO
export class LoginRequestDto {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  normalizeEmail(): string {
    return this.email.toLowerCase().trim();
  }
}

// 토큰 갱신 요청 DTO
export class RefreshTokenRequestDto {
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}

// 인증 응답 DTO
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
