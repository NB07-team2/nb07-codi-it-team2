import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import { PUBLIC_PATH, STATIC_PATH } from './utils/constants.util';
import { errorHandler } from './errors/errorHandler';
import imageRouter from './routes/image.route';
import cartRouter from './routes/cart.route';
import storeRouter from './routes/store.route';
import userRouter from './routes/user.route';
import productRouter from './routes/product.route';
import inquiryRouter from './routes/inquiry.route';
import metadataRouter from './routes/metadata.route';
import dashboardRouter from './routes/dashboard.route';
import productReviewRouter from './routes/productReview.route';

const app = express();

app.set('trust proxy', 1); //AWS 환경을 신뢰하겠다는 설정
app.use(
  cors({
    origin: [
      'https://codiit.site', // 최종 프론트엔드 주소
      'https://main.d3413g8a7ia3kb.amplifyapp.com', // 기존 프론트엔드 주소
      'http://localhost:3001', //로컬 테스트용
      'http://localhost:3000', //로컬 테스트용
    ],

    credentials: true, // 쿠키나 인증 헤더(Authorization)를 주고받기 위해 필수
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//정적 파일 설정
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

//라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/s3', imageRouter);
app.use('/api/stores', storeRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/metadata', metadataRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/product', productReviewRouter);
//에러 핸들러
app.use(errorHandler);

export default app;
