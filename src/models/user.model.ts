import { UserWithGrade } from '../types/user.type';

// 회원 정보 응답 DTO
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  type: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  grade: {
    id: string;
    name: string;
    rate: number;
    minAmount: number;
  };
  image: string;

  constructor(user: UserWithGrade) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.points = user.points;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.grade = {
      name: user.grade.name,
      id: user.grade.id,
      rate: user.grade.rate,
      minAmount: user.grade.minAmount,
    };
    this.image = user.image;
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
