import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middlewares.js';


const authRouter = Router();

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분에 5번까지
  message: { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // 1분에 10번까지
  message: { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// 로그인
authRouter.post('/login', authLimiter, asyncHandler(authController.login));// 토큰 재발급
authRouter.post('/refresh', refreshLimiter, asyncHandler(authController.refresh));
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));


export default authRouter;
