import { GradeResponse, UserResponse } from '../types/auth.type';

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
