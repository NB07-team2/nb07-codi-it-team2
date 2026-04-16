import * as userService from '../../services/user.service';
import { prisma } from '../../utils/prismaClient.util';

describe('User Integration Test - register()', () => {
  const testEmail = 'integration@test.com';

  beforeAll(async () => {
    // 등급 데이터 보장
    await prisma.grade.upsert({
      where: { id: 'grade_green' },
      update: {},
      create: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('✅ 실제 DB에 유저가 생성되고 DTO 형식에 맞춰 반환되어야 한다', async () => {
    const registerData: any = {
      email: testEmail,
      password: 'password123!',
      name: '통합테스터',
      type: 'BUYER',
    };

    const result = await userService.register(registerData);

    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(dbUser).not.toBeNull();
    expect(result.id).toBe(dbUser?.id);
    expect(result.email).toBe(testEmail);
    expect(result.grade.name).toBe('Green');
  });
});
