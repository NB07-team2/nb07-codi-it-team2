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

  // 회원가입
  it('✅ 실제 DB에 유저가 생성되고 DTO 형식에 맞춰 반환되어야 한다', async () => {
    const registerData: any = {
      email: testEmail,
      password: 'password123!',
      name: '통합테스터',
      type: 'BUYER',
      gradeId: 'grade_green',
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

  // 내 정보 조회
  it('✅ 실제 DB에서 특정 유저의 정보를 정확히 조회해와야 한다', async () => {
    // 1. 이 테스트만을 위한 전용 유저 생성
    const targetEmail = 'getme@test.com';
    const user = await prisma.user.create({
      data: {
        email: targetEmail,
        password: 'password123!',
        name: '조회테스터',
        type: 'BUYER',
        gradeId: 'grade_green',
      },
    });

    // 2. 서비스 함수 호출 (이제 user.id를 사용할 수 있습니다)
    const result = await userService.getMe(user.id);

    expect(result.id).toBe(user.id);
    expect(result.email).toBe(targetEmail);

    // 3. 사용한 데이터 삭제 (정리)
    await prisma.user.delete({ where: { id: user.id } });
  });
});
