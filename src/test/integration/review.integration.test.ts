import { User, Product, Store, Size } from '@prisma/client';
import prisma from '../../utils/prismaClient.util';
import * as ReviewService from '../../services/review.service';
import { ForbiddenError } from '../../errors/errors';

describe('Review Service Integration Tests', () => {
  let testBuyer: User;
  let otherBuyer: User;
  let testSeller: User;
  let testProduct: Product;
  let testStore: Store;
  let testSize: Size;
  let defaultGradeId: string;
  let testCategoryId: string;

  const cleanup = async () => {
    await prisma.review.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.size.deleteMany();
  };

  beforeAll(async () => {
    await cleanup();

    // 기초 데이터 생성
    const grade = await prisma.grade.create({
      data: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
    });
    defaultGradeId = grade.id;
    const category = await prisma.productCategory.create({
      data: { name: 'top' },
    });
    testCategoryId = category.id;
    testSize = await prisma.size.create({
      data: { name: 'Free', enName: 'FREE', koName: '프리' },
    });

    // 유저 생성
    testSeller = await prisma.user.create({
      data: {
        id: 'seller-1',
        type: 'SELLER',
        email: 'seller@integ.com',
        password: 'pw',
        name: '판매자',
        gradeId: defaultGradeId,
      },
    });
    testBuyer = await prisma.user.create({
      data: {
        id: 'buyer-1',
        type: 'BUYER',
        email: 'buyer@integ.com',
        password: 'pw',
        name: '구매자',
        gradeId: defaultGradeId,
      },
    });
    otherBuyer = await prisma.user.create({
      data: {
        id: 'buyer-2',
        type: 'BUYER',
        email: 'other@integ.com',
        password: 'pw',
        name: '타인',
        gradeId: defaultGradeId,
      },
    });

    // 상점 및 상품 생성
    testStore = await prisma.store.create({
      data: {
        name: '상점',
        userId: testSeller.id,
        address: '서울',
        detailAddress: '강남',
        phoneNumber: '010',
        content: '소개',
      },
    });
    testProduct = await prisma.product.create({
      data: {
        name: '상품',
        price: 10000,
        categoryId: testCategoryId,
        storeId: testStore.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // 리뷰 작성을 위한 주문 환경 세팅
  const createTestOrder = async (userId: string) => {
    const order = await prisma.order.create({
      data: {
        userId,
        name: '주문자',
        phone: '010',
        address: '주소',
        subtotal: 10000,
        totalQuantity: 1,
        usePoint: 0,
        totalSales: 10000,
        payments: { create: { status: 'CompletedPayment', price: 10000 } },
      },
    });
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: testProduct.id,
        quantity: 1,
        price: 10000,
        name: '상품',
        sizeId: testSize.id,
      },
    });
    return orderItem.id;
  };

  // --- 1. 리뷰 등록 ---
  describe('createReview', () => {
    it('결제 완료된 주문에 대해 리뷰가 생성되어야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);

      const result = await ReviewService.createReview(
        testBuyer.id,
        'BUYER',
        testProduct.id,
        {
          rating: 5,
          content: '상품이 아주 마음에 들어요! (10자 이상)',
          orderItemId: orderItemId,
        },
      );
      expect(result).toHaveProperty('id');
    });
  });

  // --- 2. 리뷰 목록 조회 ---
  describe('getProductReviewsList', () => {
    it('최신순 정렬이 정상적으로 적용되어야 한다', async () => {
      const orderItemId1 = await createTestOrder(testBuyer.id);
      const orderItemId2 = await createTestOrder(testBuyer.id);

      await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId: orderItemId1,
          rating: 5,
          content: '올드 리뷰입니다.',
          createdAt: new Date('2026-04-01'),
        },
      });
      await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId: orderItemId2,
          rating: 4,
          content: '최신 리뷰입니다.',
          createdAt: new Date('2026-04-30'),
        },
      });

      const result = await ReviewService.getProductReviewsList(testProduct.id);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0]!.content).toBe('최신 리뷰입니다.');
    });
  });

  // --- 3. 리뷰 상세 조회 ---
  describe('getReviewDetail', () => {
    it('본인이 작성한 리뷰를 상세 조회할 수 있어야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '상세 조회용 리뷰입니다.',
        },
      });

      const result = await ReviewService.getReviewDetail(
        review.id,
        testBuyer.id,
        'BUYER',
      );
      expect(result.content).toBe('상세 조회용 리뷰입니다.');
    });

    it('타인의 리뷰를 상세 조회하려고 하면 ForbiddenError를 던져야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '비밀 리뷰',
        },
      });

      await expect(
        ReviewService.getReviewDetail(review.id, otherBuyer.id, 'BUYER'),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- 4. 리뷰 수정 ---
  describe('updateReview', () => {
    it('본인이 작성한 리뷰 내용을 수정할 수 있어야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '수정 전 내용',
        },
      });

      const updatedContent = '수정 후의 새로운 리뷰 내용입니다.';
      const result = await ReviewService.updateReview(
        review.id,
        testBuyer.id,
        'BUYER',
        { content: updatedContent },
      );

      expect(result.content).toBe(updatedContent);

      const dbReview = await prisma.review.findUnique({
        where: { id: review.id },
      });
      expect(dbReview?.content).toBe(updatedContent);
    });

    it('타인의 리뷰를 수정하려고 하면 ForbiddenError를 던져야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '원본',
        },
      });

      await expect(
        ReviewService.updateReview(review.id, otherBuyer.id, 'BUYER', {
          content: '해킹',
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- 5. 리뷰 삭제 ---
  describe('deleteReview', () => {
    it('본인이 작성한 리뷰를 삭제할 수 있어야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '삭제될 리뷰',
        },
      });

      await ReviewService.deleteReview(review.id, testBuyer.id, 'BUYER');
      const dbReview = await prisma.review.findUnique({
        where: { id: review.id },
      });
      expect(dbReview).toBeNull();
    });

    it('타인의 리뷰를 삭제하려고 하면 ForbiddenError를 던져야 한다', async () => {
      const orderItemId = await createTestOrder(testBuyer.id);
      const review = await prisma.review.create({
        data: {
          userId: testBuyer.id,
          productId: testProduct.id,
          orderItemId,
          rating: 5,
          content: '살아남을 리뷰',
        },
      });

      await expect(
        ReviewService.deleteReview(review.id, otherBuyer.id, 'BUYER'),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
