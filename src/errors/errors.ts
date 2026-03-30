import { CustomError } from "./customError";

export class BadRequestError extends CustomError {
  constructor(message: string = "잘못된 요청입니다.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = "인증이 필요합니다.") {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = "접근 권한이 없습니다.") {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = "요청하신 정보를 찾을 수 없습니다.") {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = "이미 존재하는 데이터입니다.") {
    super(message, 409);
  }
}

// 401 Unauthorized
export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('토큰 만료');
  }
}

export class LoginRequiredError extends UnauthorizedError {
  constructor() {
    super('로그인이 필요합니다');
  }
}

// 400 Bad Request
export class InvalidRequestError extends BadRequestError {
  constructor() {
    super('잘못된 요청입니다');
  }
}

export class InvalidCredentialsError extends NotFoundError {
  constructor() {
    super('존재하지 않거나 비밀번호가 일치하지 않습니다');
  }
}