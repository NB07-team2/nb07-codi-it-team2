import { Request, Response, NextFunction } from 'express';
import { CustomError } from './customError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }
  if (err.name === 'StructError') {
    return res.status(400).json({
      message: '잘못된 요청입니다.',
    });
  }
  console.error('예상치 못한 에러 발생:', err);
  return res.status(500).json({
    message: '서버 내부 에러가 발생하였습니다.',
  });
};
