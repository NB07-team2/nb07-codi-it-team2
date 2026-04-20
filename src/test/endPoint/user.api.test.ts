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

// 내 정보 조회
describe('GET /api/users/me', () => {
  it('✅ 200: 인증된 유저의 정보를 정상적으로 반환해야 한다', async () => {
    // 테스트 유저 생성 및 로그인 (토큰 확보)
    const userEmail = 'me@test.com';
    await request(app).post('/api/users').send({
      email: userEmail,
      password: 'password123!',
      name: '나야나',
      type: 'BUYER',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: userEmail,
      password: 'password123!',
    });
    const accessToken = loginRes.body.accessToken;

    // 내 정보 조회 요청
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(userEmail);

    // 데이터 오염 방지
    await prisma.user.delete({ where: { email: userEmail } });
  });

  it('❌ 401: 토큰 없이 접근할 경우', async () => {
    const response = await request(app).get('/api/users/me');
    expect(response.status).toBe(401);
  });
});

// 내 정보 수정
describe('PATCH /api/users/me', () => {
  it('✅ 200: 성공적으로 정보를 수정해야 한다', async () => {
    // 가입 및 로그인
    const userEmail = 'patch@test.com';
    await request(app).post('/api/users').send({
      email: userEmail,
      password: 'password123!',
      name: '수정전',
      type: 'BUYER',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userEmail,
      password: 'password123!',
    });
    const token = loginRes.body.accessToken;

    // 수정 요청
    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '수정 후',
        currentPassword: 'password123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('수정 후');

    await prisma.user.delete({ where: { email: userEmail } });
  });
});
