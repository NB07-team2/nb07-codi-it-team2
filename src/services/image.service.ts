import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../utils/s3Client.util';
import { BadRequestError } from '../errors/errors';
import { AWS_S3_BUCKET_NAME } from '../utils/constants.util';

const BUCKET_NAME = AWS_S3_BUCKET_NAME;

// Multer 설정 (메모리 스토리지 + 보안 필터)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('PNG, JPEG, JPG 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  },
});

// 파일명 생성 헬퍼
const generateFilename = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
};

// 실제 S3 업로드 로직
async function uploadToS3(
  file: Express.Multer.File,
): Promise<{ url: string; key: string }> {
  if (!BUCKET_NAME) throw new Error('S3_BUCKET_NAME이 설정되지 않았습니다.');

  const filename = generateFilename(file);
  const key = `others/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  return { url, key };
}

// S3에서 파일 삭제
export async function deleteFromS3(fileUrl: string): Promise<void> {
  if (!BUCKET_NAME) 
    throw new Error('S3_BUCKET_NAME이 설정되지 않았습니다.');

  try {
    // 버킷 URL에서 Key 추출 (예: https://bucket.s3.amazonaws.com/others/uuid.png -> others/uuid.png)
    const fileKey = fileUrl.split('.com/')[1];

    if (!fileKey) 
      return;

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: decodeURIComponent(fileKey),
      }),
    );
    console.log(`S3 이미지 삭제 성공: ${fileKey}`);
  } catch (error) {
    console.error('S3 이미지 삭제 실패:', error);
  }
}

// 통합 업로드 서비스
export async function uploadImage(file?: Express.Multer.File) {
  if (!file) throw new BadRequestError('업로드할 파일이 없습니다.');

  return await uploadToS3(file);
}

