// express를 안 거치고, service 계층과 DB가 잘 연동되는지
import * as authService from '../../services/auth.service';
import { prisma } from '../../utils/prismaClient.util';
import { hashPassword } from '../../utils/password.util';

describe('Auth 통합 테스트', () => {
  const testUser = {
    email: 'service@test.com',
    password: 'password123!',
    name: '서비스테스터',
  };

  beforeAll(async () => {
    const hashedPassword = await hashPassword(testUser.password);

    // 등급 데이터 보장
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

    await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        ...testUser,
        password: hashedPassword,
        type: 'BUYER',
        gradeId: 'grade_green',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  // 로그인
  it('✅ 서비스의 login 함수가 토큰 객체를 반환해야 한다', async () => {
    const result = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('refreshToken');
    expect(result.response.user).toHaveProperty('email', testUser.email);
    expect(typeof result.refreshToken).toBe('string');
  });

  // 토큰 재발급
  it('✅ 실제 로그인 후 발급된 리프레시 토큰으로 토큰 재발급이 가능해야 한다', async () => {
    // 실제 유효한 리프레시 토큰 확보
    const loginResult = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    // 확보한 토큰으로 refresh 로직 실행
    const refreshResult = await authService.refreshTokens(
      loginResult.refreshToken,
    );

    // 실제 DB 환경에서도 토큰들이 잘 생성되는지
    expect(refreshResult).toHaveProperty('accessToken');
    expect(refreshResult).toHaveProperty('refreshToken');
    expect(typeof refreshResult.accessToken).toBe('string');
  });

  // 로그아웃
  it('✅ 실제 생성된 토큰으로 로그아웃 서비스 로직이 성공해야 한다', async () => {
    // 실제 로그인 후 발급된 액세스 토큰 사용
    const loginResult = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    // 로그아웃 함수가 에러 없이 잘 수행되는지 확인
    await expect(
      authService.logout(loginResult.response.accessToken),
    ).resolves.not.toThrow();
  });
});
