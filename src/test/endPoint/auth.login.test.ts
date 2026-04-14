// 사용자가 API를 호출하는 것처럼 전체 과정 검증
// 명세서 400, 401, 404 에러 케이스
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prismaClient.util';
import { hashPassword } from '../../utils/password.util';

describe('Auth EndPoint Test - POST /api/auth/login', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123!',
    name: 'TestUser',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    const hashedPassword = await hashPassword(testUser.password);

    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        type: 'BUYER',
        points: 1000,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('✅ 201: 로그인 성공 시 토큰과 유저 정보를 반환', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(201); // 명세서 기준 201
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toMatchObject({
      email: testUser.email,
      name: testUser.name,
      type: 'BUYER',
    });
    // grade 정보가 포함되어 있는지 확인
    expect(response.body.user.grade).toBeDefined();
  });

  it('❌ 400 error: 이메일 형식이 잘못된 경우 (잘못된 요청)', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'invalid-email-format',
      password: testUser.password,
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      message: '잘못된 요청입니다.',
    });
  });

  it('❌ 401 error : 비밀번호가 틀린 경우 (로그인 실패)', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  });

  it('❌ 404 error: 가입되지 않은 이메일로 로그인 시도 (사용자 없음)', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123!',
    });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: '요청한 리소스를 찾을 수 없습니다.',
    });
  });
});
