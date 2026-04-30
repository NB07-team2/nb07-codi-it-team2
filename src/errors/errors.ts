import { CustomError } from './customError';

export class BadRequestError extends CustomError {
  constructor(message: string = '잘못된 요청입니다.') {
    super(400, message, 'Bad Request');
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = '인증이 필요합니다.') {
    super(401, message, 'Unauthorized');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = '접근 권한이 없습니다.') {
    super(403, message, 'Forbidden');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(404, message, 'Not Found');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = '이미 존재하는 데이터입니다.') {
    super(409, message, 'Conflict');
    Object.setPrototypeOf(this, ConflictError.prototype);
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
    super('잘못된 요청입니다.');
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
}

export class EmailLowerCaseError extends BadRequestError {
  constructor() {
    super('이메일은 소문자로만 입력해야 합니다.');
    Object.setPrototypeOf(this, EmailLowerCaseError.prototype);
  }
}
