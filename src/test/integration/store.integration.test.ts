import prisma from '../../utils/prismaClient.util';
import {
  createStoreService,
  editStore,
  getStoreDetail,
  getMyStore,
  myStoreProducts,
  favoriteStoreRegister,
  favoriteStoreDelete,
} from '../../services/store.service';

// S3 업로드 가짜로 처리
jest.mock('../../services/image.service', () => ({
  uploadImage: jest
    .fn()
    .mockResolvedValue({ url: 'http://s3.integration.test/test-image.png' }),
  deleteFromS3: jest.fn(),
}));

describe('스토어 통합 테스트', () => {
  const testSellerId = 'integ-seller-uuid';
  const testBuyerId = 'integ-buyer-uuid';
  let createdStoreId: string;
  let testCategoryId: string;
  let testSizeId: number;
  let defaultGradeId: string;

  //테스트 전, 후 공통으로 적용될 삭제 순서
  const cleanup = async () => {
    await prisma.inquiry.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.grade.deleteMany();
  };
  // 1.테스트 전 DB 초기화 및 유저 세팅
  beforeAll(async () => {
    await cleanup();
    //테스트용 등급 생성
    const grade = await prisma.grade.create({
      data: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
    });
    defaultGradeId = grade.id;
    // 유저 생성
    await prisma.user.createMany({
      data: [
        {
          id: testSellerId,
          type: 'SELLER',
          email: 'seller@integ.com',
          password: 'password123',
          name: '통합판매자',
          gradeId: defaultGradeId,
        },
        {
          id: testBuyerId,
          type: 'BUYER',
          email: 'buyer@integ.com',
          password: 'password123',
          name: '통합구매자',
          gradeId: defaultGradeId,
        },
      ],
    });

    //카테고리 생성
    const category = await prisma.productCategory.create({
      data: { name: 'top' },
    });
    testCategoryId = category.id;

    //사이즈 생성
    const size = await prisma.size.upsert({
      where: { name: 'Free' },
      update: {},
      create: { name: 'Free', enName: 'FREE', koName: '프리' },
    });
    testSizeId = size.id;
  });

  // 2️.테스트 후 DB 청소
  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // ==========================================
  // 시나리오 흐름대로 7개 함수를 모두 검증.
  // ==========================================

  it('1. [createStoreService] 새로운 스토어를 DB에 생성한다', async () => {
    const storeData = {
      name: '통합 테스트 스토어',
      address: '서울시',
      detailAddress: '101호',
      phoneNumber: '010-1111-2222',
      content: '스토어 설명',
    };

    const result = await createStoreService(testSellerId, 'SELLER', storeData);
    createdStoreId = result.id;

    const dbStore = await prisma.store.findUnique({
      where: { id: createdStoreId },
    });
    expect(dbStore).not.toBeNull();
    expect(dbStore?.phoneNumber).toBe('01011112222');
  });

  it('2. [editStore] 생성된 스토어의 정보를 수정한다', async () => {
    const updateData = {
      name: '수정된 이름',
      address: '서울시',
      detailAddress: '202호',
      phoneNumber: '010-3333-4444',
      content: '설명 수정',
    };

    await editStore(testSellerId, 'SELLER', createdStoreId, updateData);

    const updatedDbStore = await prisma.store.findUnique({
      where: { id: createdStoreId },
    });
    expect(updatedDbStore?.name).toBe('수정된 이름');
  });

  it('3. [favoriteStoreRegister] 관심 스토어로 등록한다', async () => {
    await favoriteStoreRegister(testBuyerId, createdStoreId);

    const dbFavorite = await prisma.favorite.findUnique({
      where: {
        userId_storeId: { userId: testBuyerId, storeId: createdStoreId },
      },
    });
    expect(dbFavorite).not.toBeNull();
  });

  it('4. [getStoreDetail] 타인이 스토어 상세 조회 시 찜 횟수가 포함되어야 한다', async () => {
    const result = await getStoreDetail(createdStoreId);

    expect(result.id).toBe(createdStoreId);
    expect(result.favoriteCount).toBe(1); // 방금 위에서 찜했으므로 1
  });

  it('5. [myStoreProducts] 내 스토어 상품 조회 전 상품을 강제 주입하고 목록을 잘 불러오는지 확인한다', async () => {
    await prisma.product.create({
      data: {
        storeId: createdStoreId,
        categoryId: testCategoryId,
        name: '통합 테스트 상품',
        price: 10000,
        content: '내용',
        sales: 5,
        stocks: {
          create: [{ sizeId: testSizeId, quantity: 10 }],
        },
      },
    });
    const result = await myStoreProducts({
      page: 1,
      pageSize: 10,
      userId: testSellerId,
      userType: 'SELLER',
    });

    expect(result.totalCount).toBe(1);
    expect(result.list[0]?.name).toBe('통합 테스트 상품');
  });

  it('6. [getMyStore] 내 스토어 조회 시 총 판매량(sales)과 통계가 합산되어 나와야 한다', async () => {
    const result = await getMyStore(testSellerId, 'SELLER');

    expect(result.id).toBe(createdStoreId);
    expect(result.totalSoldCount).toBe(5);
    expect(result.monthFavoriteCount).toBe(1); // 이번 달 찜 횟수 1회
  });

  it('7. [favoriteStoreDelete] 등록된 관심 스토어를 해제하면 DB에서 삭제되어야 한다', async () => {
    await favoriteStoreDelete(testBuyerId, createdStoreId);

    const deletedFavorite = await prisma.favorite.findUnique({
      where: {
        userId_storeId: { userId: testBuyerId, storeId: createdStoreId },
      },
    });
    expect(deletedFavorite).toBeNull();
  });
});
