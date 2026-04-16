import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prismaClient.util';

describe('User Endpoint Test - POST /api/users', () => {
  const testEmail = 'endpoint@test.com';

  // 등급 데이터 생성
  beforeAll(async () => {
    await prisma.grade.upsert({
      where: { id: 'grade_green' },
      update: {},
      create: {
        id: 'grade_green',
        name: 'Green',
        rate: 1,
        minAmount: 0,
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it('✅ 201: 성공적으로 회원가입이 완료되어야 한다', async () => {
    const response = await request(app).post('/api/users').send({
      name: '엔드포인트테스터',
      email: testEmail,
      password: 'password123!',
      type: 'BUYER',
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(testEmail);
    expect(response.body).toHaveProperty('id');
    // DTO에서 제외된 비밀번호가 응답에 없는지 확인( 보안 )
    expect(response.body).not.toHaveProperty('password');
  });

  it('❌ 409: 중복된 이메일로 가입 시도 시', async () => {
    await request(app).post('/api/users').send({
      email: testEmail,
      password: 'password123!',
      name: '기존유저',
      type: 'BUYER',
    });

    const response = await request(app).post('/api/users').send({
      email: testEmail,
      password: 'password123!',
      name: '새유저',
      type: 'BUYER',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('이미 존재하는 유저입니다.');
  });
});
