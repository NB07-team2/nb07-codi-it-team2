// express를 안 거치고, service 계층과 DB가 잘 연동되는지
import * as authService from '../../services/auth.service';
import { prisma } from '../../utils/prismaClient.util';
import { hashPassword } from '../../utils/password.util';

describe('Auth 통합 테스트 - Service', () => {
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
});
