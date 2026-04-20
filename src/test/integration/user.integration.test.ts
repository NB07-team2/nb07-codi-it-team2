import * as userService from '../../services/user.service';
import { prisma } from '../../utils/prismaClient.util';
import * as passwordUtil from '../../utils/password.util';

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
    // 전용 유저 생성
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

    const result = await userService.getMe(user.id);

    expect(result.id).toBe(user.id);
    expect(result.email).toBe(targetEmail);

    // 사용한 데이터 삭제 (정리)
    await prisma.user.delete({ where: { id: user.id } });
  });

  // 내 정보 수정
  it('✅ 실제 DB에서 유저 정보를 수정하면 반영되어야 한다', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'update@test.com',
        password: await passwordUtil.hashPassword('pass123!'),
        name: '기본이름',
        type: 'BUYER',
        gradeId: 'grade_green',
      },
    });

    const updateData = {
      name: '수정된 이름',
      currentPassword: 'pass123!',
    };
    const result = await userService.updateMe(user.id, updateData);

    expect(result.name).toBe('수정된 이름');

    // 사용한 데이터 삭제 (정리)
    await prisma.user.delete({ where: { id: user.id } });
  });

  // 관심 스토어 조회
  it('✅ DB에서 유저의 관심 스토어 목록을 정확히 가져와야 한다', async () => {
    const uniqueTime = Date.now();

    // 유저 생성 (구매자)
    const user = await prisma.user.create({
      data: {
        email: `fav_tester_${uniqueTime}@test.com`,
        password: 'password123!',
        name: '찜유저',
        type: 'BUYER',
        gradeId: 'grade_green',
      },
    });

    // 판매자 및 스토어 생성
    const seller = await prisma.user.create({
      data: {
        email: `seller_${uniqueTime}@test.com`,
        password: 'password123!',
        name: '스토어주인',
        type: 'SELLER',
        gradeId: 'grade_green',
      },
    });

    const store = await prisma.store.create({
      data: {
        name: '찜하고싶은가게',
        address: '서울시 강남구',
        detailAddress: '테스트빌딩',
        phoneNumber: `010${uniqueTime.toString().slice(-8)}`,
        content: '가게 소개입니다.',
        userId: seller.id,
      },
    });

    // 관심 등록
    await prisma.favorite.create({
      data: { userId: user.id, storeId: store.id },
    });

    const result = await userService.getFavorites(user.id);

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.store.name).toBe('찜하고싶은가게');

    // 정리 ( user만 지워도 되지만 안전하게 개별 삭제 )
    await prisma.favorite.deleteMany({ where: { userId: user.id } });
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [user.id, seller.id] } },
    });
  });

  // 회원 탈퇴
  it('✅ 회원 탈퇴 시 DB에서 유저 데이터가 완전히 삭제되어야 한다', async () => {
    // 유저 생성
    const user = await prisma.user.create({
      data: {
        email: 'delete@test.com',
        password: '123',
        name: '탈퇴유저',
        type: 'BUYER',
        gradeId: 'grade_green',
      },
    });

    // 탈퇴 실행
    await userService.deleteMe(user.id);

    // 조회 시 없어야 함
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser).toBeNull();
  });
});
