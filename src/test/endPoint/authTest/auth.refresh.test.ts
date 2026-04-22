import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

describe('Auth EndPoint Test - POST /api/auth/refresh', () => {
  const REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ||
    'test_refresh_secret_key_for_jest_testing_only_67890';

  it('✅ 200: 유효한 Refresh Token으로 Access Token 재발급 성공', async () => {
    // 유효한 가짜 Refresh Token 생성
    const validRefreshToken = jwt.sign(
      { id: 'test-user-id', type: 'BUYER' },
      REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    // API 요청
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refresh-token=${validRefreshToken}`]);

    // 응답 검증
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');
  });

  it('❌ 400 error: 잘못된 요청 (토큰 없이, 잘못된 형식 등)', async () => {
    const response = await request(app).post('/api/auth/refresh');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      message: '리프레시 토큰이 없습니다.',
    });
  });

  it('❌ 401 error: 유효하지 않거나 만료된 Refresh Token', async () => {
    // 이미 만료된 토큰
    const expiredRefreshToken = jwt.sign(
      { id: 'test-user-id', type: 'BUYER' },
      REFRESH_SECRET,
      { expiresIn: '-1h' },
    );

    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refresh-token=${expiredRefreshToken}`]);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      message: '토큰 만료',
      error: 'Unauthorized',
    });
  });

  it('❌ 401 error: 위조된(유효하지 않은) Refresh Token', async () => {
    // 위조 토큰
    const invalidRefreshToken = jwt.sign(
      { id: 'test-user-id', type: 'BUYER' },
      'wrong_secret_key',
      { expiresIn: '7d' },
    );

    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refresh-token=${invalidRefreshToken}`]);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    });
  });
});
