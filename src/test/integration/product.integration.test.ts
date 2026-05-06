import prisma from '../../utils/prismaClient.util';
import * as productService from '../../services/product.service';
import * as imageService from '../../services/image.service';

jest.mock('../../services/image.service');

describe('Product Service Integration Test', () => {
  const TEST_USER_ID = 'test-int-seller-id';
  const TEST_STORE_ID = 'test-int-store-id';
  let createdProductId: string;

  beforeAll(async () => {
    await prisma.reply.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.size.deleteMany();

    // User 생성을 위한 기본 Grade 생성
    await prisma.grade.create({
      data: { id: 'grade_green', name: '그린', rate: 0, minAmount: 0 },
    });

    // 판매자 User 생성
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        name: '통합테스트판매자',
        email: 'seller.int@test.com',
        password: 'hashed-password',
        type: 'SELLER',
        gradeId: 'grade_green',
      },
    });

    // Store 생성
    await prisma.store.create({
      data: {
        id: TEST_STORE_ID,
        userId: TEST_USER_ID,
        name: '통합테스트 스토어',
        address: '서울시 강남구',
        detailAddress: '코드잇 101호',
        phoneNumber: '010-9999-8888',
        content: '통합 테스트용 스토어입니다.',
      },
    });

    // Product Category 생성
    await prisma.productCategory.create({
      data: { name: 'top' },
    });

    // Size 생성
    await prisma.size.create({
      data: { id: 1, name: 'S', enName: 'SMALL', koName: '스몰' },
    });
  });

  // 모든 테스트 종료 후: DB 클린 및 연결 해제
  afterAll(async () => {
    await prisma.reply.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.size.deleteMany();

    await prisma.$disconnect();
  });

  // 통합 테스트 케이스
  describe('createProduct (상품 생성 통합 테스트)', () => {
    it('실제 DB에 상품과 재고가 완벽히 저장되어야 한다', async () => {
      const mockFile = { originalname: 'real-int.png' } as Express.Multer.File;
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: 'https://s3.com/real-int.png',
      });

      const productData = {
        name: '통합 테스트용 니트',
        price: 35000,
        content: 'DB 연동 테스트 설명',
        categoryName: 'top' as const,
        stocks: [{ sizeId: 1, quantity: 50 }],
      };

      // 서비스 실행
      const result = await productService.createProduct(
        TEST_USER_ID,
        'SELLER',
        productData,
        mockFile,
      );

      // 결과 객체 검증
      expect(result.name).toBe('통합 테스트용 니트');
      expect(result.price).toBe(35000);
      expect(result.image).toBe('https://s3.com/real-int.png');

      // 실제 DB에 쿼리를 날려 데이터가 진짜 들어갔는지 검증
      const savedProduct = await prisma.product.findUnique({
        where: { id: result.id },
        include: { stocks: true },
      });

      expect(savedProduct).not.toBeNull();
      expect(savedProduct?.categoryId).toBeDefined();
      expect(savedProduct?.stocks).toHaveLength(1);
      expect(savedProduct!.stocks[0]!.quantity).toBe(50);

      // 다음 테스트를 위해 전역 변수에 ID 저장
      createdProductId = result.id;
    });
  });

  describe('getProductDetail (상품 상세 조회 통합 테스트)', () => {
    it('DB에 방금 저장된 상품 정보를 정상적으로 가져와야 한다', async () => {
      const result = await productService.getProductDetail(
        createdProductId,
        TEST_USER_ID,
      );

      expect(result.id).toBe(createdProductId);
      expect(result.storeName).toBe('통합테스트 스토어');
      expect(result.category.name).toBe('top');
      expect(result.stocks[0]!.quantity).toBe(50);
      expect(result.stocks[0]!.size.name).toBe('S');
    });
  });

  describe('updateProduct (상품 수정 통합 테스트)', () => {
    it('DB에 저장된 상품의 이름과 재고가 정상적으로 수정되어야 한다', async () => {
      const updateData = {
        name: '수정된 니트',
        price: 40000,
        stocks: [{ sizeId: 1, quantity: 100 }], // 수량 50 -> 100으로 변경
      };

      const result = await productService.updateProduct(
        TEST_USER_ID,
        'SELLER',
        createdProductId,
        updateData,
      );

      expect(result.name).toBe('수정된 니트');
      expect(result.price).toBe(40000);

      // DB 확인
      const updatedProduct = await prisma.product.findUnique({
        where: { id: createdProductId },
        include: { stocks: true },
      });

      expect(updatedProduct?.name).toBe('수정된 니트');
      expect(updatedProduct?.price).toBe(40000);
      expect(updatedProduct!.stocks[0]!.quantity).toBe(100);
    });
  });
  describe('getProducts (상품 목록 조회 통합 테스트)', () => {
    it('DB에 저장된 상품들이 페이징 및 필터 조건에 맞게 조회되어야 한다', async () => {
      const category = await prisma.productCategory.findUnique({
        where: { name: 'top' },
      });

      // 1. 조회용 추가 상품 2개 더 생성 (검색/정렬 확인용)
      await prisma.product.create({
        data: {
          id: 'test-prod-2',
          name: '통합 테스트용 바지',
          price: 40000,
          storeId: TEST_STORE_ID,
          categoryId: category!.id,
        },
      });
      await prisma.product.create({
        data: {
          id: 'test-prod-3',
          name: '통합 테스트용 아우터',
          price: 80000,
          storeId: TEST_STORE_ID,
          categoryId: category!.id,
        },
      });

      // 2. 서비스 로직 호출 (검색어: '테스트', 정렬: 'highPrice')
      const query = {
        page: 1,
        pageSize: 10,
        search: '테스트',
        sort: 'highPrice' as const,
      };

      const result = await productService.getProducts(query);

      // 3. 결과 검증
      expect(result.totalCount).toBeGreaterThanOrEqual(3); // 생성한 상품이 총 3개 이상이어야 함
      expect(result.list.length).toBeGreaterThanOrEqual(3);

      // 가격 내림차순(highPrice) 정렬 검증 (80000 -> 40000 -> 35000)
      expect(result.list[0]!.price).toBe(80000);
      expect(result.list[0]!.name).toContain('아우터');
    });
  });

  describe('deleteProduct (상품 삭제 통합 테스트)', () => {
    it('DB에서 상품 및 연관된 재고 데이터가 모두 Cascade 삭제되어야 한다', async () => {
      (imageService.deleteFromS3 as jest.Mock).mockResolvedValue(true);

      const result = await productService.deleteProduct(
        TEST_USER_ID,
        'SELLER',
        createdProductId,
      );

      expect(result.message).toBe('상품이 삭제되었습니다.');

      // 💡 [핵심] 삭제 후 실제 DB에서 조회되지 않아야 함 (Stock도 함께 날아갔는지 확인)
      const deletedProduct = await prisma.product.findUnique({
        where: { id: createdProductId },
      });
      const deletedStocks = await prisma.stock.findMany({
        where: { productId: createdProductId },
      });

      expect(deletedProduct).toBeNull();
      expect(deletedStocks.length).toBe(0);
    });
  });
});
