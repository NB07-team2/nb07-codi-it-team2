import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from './constants.util';

dotenv.config(); // 환경 변수 로드 필수!

const s3Client = new S3Client({
  region: AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export default s3Client;
