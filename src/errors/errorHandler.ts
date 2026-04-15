import { Request, Response, NextFunction } from 'express';
import { CustomError } from './customError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError || err.name === 'ZodError') {
    return res.status(400).json({
      statusCode: 400,
      message: '잘못된 요청입니다.',
      error: 'Bad Request',
    });
  }
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
  }
  if (err.name === 'StructError') {
    return res.status(400).json({
      statusCode: 400,
      message: '잘못된 요청입니다.',
      error: 'Bad Request',
    });
  }
  console.error('예상치 못한 에러 발생:', err);
  return res.status(500).json({
    statusCode: 500,
    message: '서버 내부 에러가 발생하였습니다.',
    error: 'Internal Server Error',
  });
};
