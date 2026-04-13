import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

// S3 모킹
jest.mock('../../utils/s3Client.util', () => ({
  send: jest.fn().mockResolvedValue(true),
}));

describe('POST /api/s3/upload (이미지 업로드 API)', () => {
  let validToken: string;

  beforeAll(() => {
    // 인증 미들웨어를 통과하기 위한 가짜 토큰 생성
    validToken = jwt.sign(
      { id: 'test-user-id', type: 'BUYER' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks(); // 매 테스트마다 모킹 초기화
  });

  it('정상적인 이미지 파일을 업로드하면 201 상태코드와 URL을 반환해야 한다', async () => {
    // 1. 메모리 상에 가짜 이미지 파일(Buffer) 만들기
    const dummyImageBuffer = Buffer.from('fake image content');

    // 2. Supertest로 요청 보내기
    const response = await request(app)
      .post('/api/s3/upload')
      .set('Authorization', `Bearer ${validToken}`) // 토큰 헤더 추가
      // .attach()를 사용하여 multipart/form-data 전송 (필드명 'image')
      .attach('image', dummyImageBuffer, 'test-image.png');

    // 3. 응답 검증
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('업로드 성공');
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('key');
  });

  it('허용되지 않는 확장자(txt)를 업로드하면 Multer 에러가 나야 한다', async () => {
    const dummyTextBuffer = Buffer.from('this is text, not an image');

    const response = await request(app)
      .post('/api/s3/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('image', dummyTextBuffer, 'test.txt'); // txt 파일 첨부

    // Multer의 fileFilter에서 던진 에러가 잡히는지 확인
    expect(response.status).not.toBe(201);
  });

  it('토큰 없이 요청하면 401 에러를 반환해야 한다', async () => {
    const dummyImageBuffer = Buffer.from('fake image content');

    const response = await request(app)
      .post('/api/s3/upload')
      .attach('image', dummyImageBuffer, 'test.png'); // 토큰 세팅 안 함

    expect(response.status).toBe(401);
  });
});
