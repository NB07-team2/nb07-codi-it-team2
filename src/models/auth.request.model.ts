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

// 내 정보 수정 요청 DTO
export class UpdateUserRequestDto {
  name?: string;
  password?: string;
  currentPassword: string;
  image?: string;

  constructor(data: {
    name?: string;
    password?: string;
    currentPassword: string;
    image?: string;
  }) {
    this.name = data.name;
    this.password = data.password;
    this.currentPassword = data.currentPassword;
    this.image = data.image;
  }
}

// 토큰 갱신 요청 DTO
export class RefreshTokenRequestDto {
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}
