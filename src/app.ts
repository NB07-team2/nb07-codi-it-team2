import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import { PUBLIC_PATH, STATIC_PATH } from './utils/constants.util';
import { errorHandler } from './errors/errorHandler';
import imageRouter from './routes/image.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//정적 파일 설정
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

//라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/s3', imageRouter);

//에러 핸들러
app.use(errorHandler);

export default app;
