import request from 'supertest';
import * as jwtUtil from '../../../utils/jwt.util';
import { UserType } from '@prisma/client';
import { env } from '../../../utils/env.util';
import app from '../../../app';

describe('Auth EndPoint Test - POST /api/auth/logout', () => {
  it('✅ 200: 로그아웃 성공 시 명세서 메시지 반환', async () => {
    const validToken = jwtUtil.generateAccessToken(
      'test-user-id',
      UserType.BUYER,
    );

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: '성공적으로 로그아웃되었습니다.',
    });
  });

  it('❌ 401: 유효하지 않은 토큰으로 로그아웃 시도 시', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      message: '인증이 필요합니다.',
      error: 'Unauthorized',
    });
  });
});
