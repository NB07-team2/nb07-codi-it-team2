import * as productService from '../../services/product.service';
import { ProductRepository } from '../../repositories/product.repository';
import prisma from '../../utils/prismaClient.util';
import * as imageService from '../../services/image.service';
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../errors/errors';
import { GetProductsQuery } from '../../structs/product.struct';
import { ProductWithRelations } from '../../types/product.type';

jest.mock('../../repositories/product.repository');
jest.mock('../../services/image.service');
jest.mock('../../utils/prismaClient.util', () => ({
  __esModule: true,
  default: {
    store: { findUnique: jest.fn() },
    productCategory: { findUnique: jest.fn() },
    product: { findUnique: jest.fn() },
    size: { findMany: jest.fn() },
    $transaction: jest.fn(async (cb) => {
      const fakeTxClient = {
        reply: { deleteMany: jest.fn() },
        inquiry: { deleteMany: jest.fn() },
        stock: { deleteMany: jest.fn(), update: jest.fn() },
        cartItem: { deleteMany: jest.fn() },
        product: { delete: jest.fn(), update: jest.fn() },
      };
      return await cb(fakeTxClient);
    }),
  },
}));

describe('Product Service Unit Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 상품 등록
  describe('createProduct (상품 등록)', () => {
    const mockUserId = 'seller-test-id';
    const mockData = {
      name: 'Test Product',
      price: 10000,
      content: '테스트 내용',
      categoryName: 'top' as const,
      stocks: [{ sizeId: 1, quantity: 10 }],
    };

    it('판매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        productService.createProduct(mockUserId, 'BUYER', mockData),
      ).rejects.toThrow(ForbiddenError);
    });

    it('스토어가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (prisma.store.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.createProduct(mockUserId, 'SELLER', mockData),
      ).rejects.toThrow(NotFoundError);
    });

    it('이미 같은 이름의 상품이 스토어에 있으면 ConflictError를 던져야 한다', async () => {
      (prisma.store.findUnique as jest.Mock).mockResolvedValue({
        id: 'store-id',
      });
      (ProductRepository.findByNameInStore as jest.Mock).mockResolvedValue({
        id: 'existing-product',
      });

      await expect(
        productService.createProduct(mockUserId, 'SELLER', mockData),
      ).rejects.toThrow(ConflictError);
    });

    it('존재하지 않는 카테고리명일 경우 NotFoundError를 던져야 한다', async () => {
      (prisma.store.findUnique as jest.Mock).mockResolvedValue({
        id: 'store-id',
      });
      (ProductRepository.findByNameInStore as jest.Mock).mockResolvedValue(
        null,
      );
      (prisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null); // 카테고리 없음

      await expect(
        productService.createProduct(mockUserId, 'SELLER', mockData),
      ).rejects.toThrow(NotFoundError);
    });

    it('모든 조건이 충족되면 이미지를 업로드하고 상품을 생성해야 한다', async () => {
      const mockStore = { id: 'store-id', name: '테스트스토어' };
      const mockCategory = { id: 'cat-id', name: 'top' };
      const mockFile = { originalname: 'test.png' } as Express.Multer.File;
      const mockUploadedImageUrl = 'https://s3.com/test.png';

      // 가짜 상품 데이터
      const mockCreatedProduct = {
        id: 'prod-id',
        name: mockData.name,
        price: mockData.price,
        image: mockUploadedImageUrl,
        storeId: mockStore.id,
        categoryId: mockCategory.id,
        store: mockStore,
        category: mockCategory,
        reviews: [],
        inquiries: [],
        stocks: [{ id: 'stock-id', quantity: 10, size: { id: 1, name: 'M' } }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.store.findUnique as jest.Mock).mockResolvedValue(mockStore);
      (ProductRepository.findByNameInStore as jest.Mock).mockResolvedValue(
        null,
      );
      (prisma.productCategory.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: mockUploadedImageUrl,
      });
      (ProductRepository.create as jest.Mock).mockResolvedValue(
        mockCreatedProduct,
      );

      const result = await productService.createProduct(
        mockUserId,
        'SELLER',
        mockData,
        mockFile,
      );

      expect(imageService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(ProductRepository.create).toHaveBeenCalled();
      expect(result.name).toBe(mockData.name);
      expect(result.image).toBe(mockUploadedImageUrl);
    });
  });

  // 상품 목록 조회
  describe('getProducts (상품 목록 조회)', () => {
    it('기본 조건으로 상품 목록과 전체 개수를 반환해야 한다', async () => {
      const mockQuery: GetProductsQuery = {
        page: 1,
        pageSize: 10,
        sort: 'recent',
      };
      const mockList = [{ id: 'prod-1', reviews: [], stocks: [] }];
      (ProductRepository.findAll as jest.Mock).mockResolvedValue({
        list: mockList,
        totalCount: 1,
      });

      const result = await productService.getProducts(mockQuery);

      expect(ProductRepository.findAll).toHaveBeenCalledWith(mockQuery);
      expect(result.list).toEqual(mockList);
      expect(result.totalCount).toBe(1);
    });

    it('highRating 정렬일 경우 평점이 높은 순서대로 직접 정렬하여 반환해야 한다', async () => {
      const mockQuery: GetProductsQuery = {
        page: 1,
        pageSize: 2,
        sort: 'highRating',
      };
      // 리뷰 평점: prod-1 (3점), prod-2 (5점)
      const mockList = [
        {
          id: 'prod-1',
          reviews: [{ rating: 3 }],
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'prod-2',
          reviews: [{ rating: 5 }],
          createdAt: new Date('2026-01-02'),
        },
      ];

      (ProductRepository.findAll as jest.Mock).mockResolvedValue({
        list: mockList,
        totalCount: 2,
      });

      const result = await productService.getProducts(mockQuery);

      // prod-2가 5점이므로 먼저 와야 함
      expect(result.list[0]!.id).toBe('prod-2');
      expect(result.list[1]!.id).toBe('prod-1');
    });
  });

  // 상품 수정
  describe('updateProduct (상품 수정)', () => {
    const mockUserId = 'my-seller-id';
    const mockProductId = 'prod-1';

    const mockProductWithRelations = {
      id: mockProductId,
      name: 'Old Name',
      price: 10000,
      image: 'https://s3.com/old.png',
      storeId: 'store-1',
      categoryId: 'cat-1',
      store: { userId: mockUserId, name: 'My Store' },
      category: { name: 'top' },
      reviews: [],
      inquiries: [],
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('판매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        productService.updateProduct(mockUserId, 'BUYER', mockProductId, {}),
      ).rejects.toThrow(ForbiddenError);
    });

    it('존재하지 않는 상품이면 NotFoundError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        productService.updateProduct(mockUserId, 'SELLER', mockProductId, {}),
      ).rejects.toThrow(NotFoundError);
    });

    it('자신의 스토어 상품이 아니면 ForbiddenError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProductId,
        // 다른 SELLER
        store: { userId: 'other-seller-id' },
      });
      await expect(
        productService.updateProduct(mockUserId, 'SELLER', mockProductId, {}),
      ).rejects.toThrow(ForbiddenError);
    });

    it('변경할 카테고리가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );
      (prisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.updateProduct(mockUserId, 'SELLER', mockProductId, {
          categoryName: 'invalid',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('변경할 사이즈가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );
      (prisma.size.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'S' },
      ]);

      await expect(
        productService.updateProduct(mockUserId, 'SELLER', mockProductId, {
          stocks: [{ size: 'M', quantity: 5 }],
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('정상적인 요청일 경우 이미지를 교체하고 상품 정보를 업데이트해야 한다', async () => {
      const mockFile = { originalname: 'new.png' } as Express.Multer.File;
      const newImageUrl = 'https://s3.com/new.png';

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: newImageUrl,
      });
      (ProductRepository.update as jest.Mock).mockResolvedValue({
        ...mockProductWithRelations,
        image: newImageUrl,
        name: 'New Name',
      });

      const result = await productService.updateProduct(
        mockUserId,
        'SELLER',
        mockProductId,
        { name: 'New Name' },
        mockFile,
      );

      expect(imageService.deleteFromS3).toHaveBeenCalledWith(
        'https://s3.com/old.png',
      );
      expect(ProductRepository.update).toHaveBeenCalled();
      expect(result.image).toBe(newImageUrl);
      expect(result.name).toBe('New Name');
    });
  });

  // 상품 상세 조회
  describe('getProductDetail (상품 상세 조회)', () => {
    it('상품이 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (ProductRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        productService.getProductDetail('invalid-id'),
      ).rejects.toThrow(NotFoundError);
    });

    it('상품이 존재하면 ProductResponseDto로 변환하여 반환해야 한다', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        reviews: [],
        inquiries: [],
        stocks: [],
        store: { name: 'Store' },
        category: { name: 'top' },
      };
      (ProductRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductDetail('prod-1');
      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('Test Product');
    });

    describe('문의 권한 체크 (비밀글 필터링)', () => {
      const mockProductWithSecret = {
        id: 'prod-1',
        name: 'Secret Product',
        price: 10000,
        storeId: 'store-1',
        categoryId: 'cat-1',
        image: 'test.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        store: { userId: 'seller-id', name: 'Store' },
        category: { name: 'top' },
        reviews: [],
        stocks: [],
        inquiries: [
          {
            id: 'inq-1',
            userId: 'buyer-id',
            title: '비밀 문의',
            content: '원본 내용',
            isSecret: true,
            status: 'WaitingAnswer',
            createdAt: new Date(),
            updatedAt: new Date(),
            reply: {
              id: 'reply-1',
              content: '원본 답변',
              createdAt: new Date(),
              updatedAt: new Date(),
              user: { id: 'seller-id', name: '판매자' },
            },
          },
        ],
      } as unknown as ProductWithRelations;

      it('비밀글일 때, 제3자는 "비밀글입니다."라고 보여야 한다', async () => {
        (ProductRepository.findById as jest.Mock).mockResolvedValue(
          mockProductWithSecret,
        );
        const result = await productService.getProductDetail('prod-1');

        expect(result.inquiries[0]!.content).toBe('비밀글입니다.');
        expect(result.inquiries[0]!.reply?.content).toBe('비밀글입니다.');
      });

      it('비밀글이라도 작성자 본인에게는 원본이 보여야 한다', async () => {
        (ProductRepository.findById as jest.Mock).mockResolvedValue(
          mockProductWithSecret,
        );
        const result = await productService.getProductDetail(
          'prod-1',
          'buyer-id',
        );

        expect(result.inquiries[0]!.content).toBe('원본 내용');
        expect(result.inquiries[0]!.reply?.content).toBe('원본 답변');
      });

      it('비밀글이라도 판매자에게는 원본이 보여야 한다', async () => {
        (ProductRepository.findById as jest.Mock).mockResolvedValue(
          mockProductWithSecret,
        );
        const result = await productService.getProductDetail(
          'prod-1',
          'seller-id',
        ); // 판매자

        expect(result.inquiries[0]!.content).toBe('원본 내용');
        expect(result.inquiries[0]!.reply?.content).toBe('원본 답변');
      });
    });
  });

  // 상품 삭제
  describe('deleteProduct (상품 삭제)', () => {
    const mockUserId = 'my-seller-id';
    const mockProductId = 'prod-1';

    it('판매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        productService.deleteProduct(mockUserId, 'BUYER', mockProductId),
      ).rejects.toThrow(ForbiddenError);
    });

    it('상품이 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (ProductRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        productService.deleteProduct(mockUserId, 'SELLER', mockProductId),
      ).rejects.toThrow(NotFoundError);
    });

    it('자신의 스토어 상품이 아니면 ForbiddenError를 던져야 한다', async () => {
      (ProductRepository.findById as jest.Mock).mockResolvedValue({
        id: mockProductId,
        store: { userId: 'other-seller-id' }, // 주인이 다름
      });
      await expect(
        productService.deleteProduct(mockUserId, 'SELLER', mockProductId),
      ).rejects.toThrow(ForbiddenError);
    });

    it('정상적으로 삭제되면 S3 이미지를 지우고 성공 메시지를 반환해야 한다', async () => {
      const mockProduct = {
        id: mockProductId,
        image: 'https://s3.com/delete-me.png',
        store: { userId: mockUserId },
      };
      (ProductRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ProductRepository.delete as jest.Mock).mockResolvedValue(true);

      const result = await productService.deleteProduct(
        mockUserId,
        'SELLER',
        mockProductId,
      );

      expect(ProductRepository.delete).toHaveBeenCalledWith(mockProductId);
      expect(imageService.deleteFromS3).toHaveBeenCalledWith(mockProduct.image);
      expect(result.message).toBe('상품이 삭제되었습니다.');
    });
  });
});
