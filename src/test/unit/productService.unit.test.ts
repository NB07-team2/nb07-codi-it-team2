import * as productService from '../../services/product.service';
import { ProductRepository } from '../../repositories/product.repository';
import prisma from '../../utils/prismaClient.util';
import * as imageService from '../../services/image.service';
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../errors/errors';

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

  // 1. 상품 등록 테스트 (기존 유지)
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
      (prisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        productService.createProduct(mockUserId, 'SELLER', mockData),
      ).rejects.toThrow(NotFoundError);
    });

    it('모든 조건이 충족되면 상품을 생성해야 한다', async () => {
      const mockStore = { id: 'store-id', name: '테스트스토어' };
      const mockCategory = { id: 'cat-id', name: 'top' };
      const mockCreatedProduct = {
        id: 'prod-id',
        name: mockData.name,
        price: mockData.price,
        image: 'test.png',
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
      (ProductRepository.create as jest.Mock).mockResolvedValue(
        mockCreatedProduct,
      );

      const result = await productService.createProduct(
        mockUserId,
        'SELLER',
        mockData,
      );
      expect(ProductRepository.create).toHaveBeenCalled();
      expect(result.name).toBe(mockData.name);
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
      store: { userId: mockUserId, name: 'My Store' },
      reviews: [],
      inquiries: [],
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('변경할 사이즈가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );
      // 사이즈 목록에는 존재하지만 요청에 포함된 sizeId는 없는 경우
      (prisma.size.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'S' },
      ]);

      await expect(
        productService.updateProduct(mockUserId, 'SELLER', mockProductId, {
          stocks: [{ sizeId: 2, quantity: 5 }], // 존재하지 않는 ID
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('정상적인 요청일 경우 상품 정보를 업데이트해야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );
      (ProductRepository.update as jest.Mock).mockResolvedValue(
        mockProductWithRelations,
      );

      const result = await productService.updateProduct(
        mockUserId,
        'SELLER',
        mockProductId,
        { name: 'New Name' },
      );
      expect(ProductRepository.update).toHaveBeenCalled();
      expect(result.id).toBe(mockProductId);
    });
  });

  // 상품 삭제
  describe('deleteProduct (상품 삭제)', () => {
    const mockUserId = 'my-seller-id';
    const mockProductId = 'prod-1';

    it('상품이 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        productService.deleteProduct(mockUserId, 'SELLER', mockProductId),
      ).rejects.toThrow(NotFoundError);
    });

    it('자신의 스토어 상품이 아니면 ForbiddenError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProductId,
        store: { userId: 'other-seller-id' },
      });
      await expect(
        productService.deleteProduct(mockUserId, 'SELLER', mockProductId),
      ).rejects.toThrow(ForbiddenError);
    });

    it('구매 내역이 존재하는 상품은 NotDeletedError를 던져야 한다', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProductId,
        store: { userId: mockUserId },
        orderItems: [{ id: 'order-1' }],
      });

      await expect(
        productService.deleteProduct(mockUserId, 'SELLER', mockProductId),
      ).rejects.toThrow('구매 내역이 존재하는 상품은 삭제할 수 없습니다.');
    });

    it('정상적으로 삭제되면 S3 이미지를 지우고 성공 메시지를 반환해야 한다', async () => {
      const mockProduct = {
        id: mockProductId,
        image: 'https://s3.com/keep-me.png',
        store: { userId: mockUserId },
        orderItems: [], // 주문 내역 없음
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
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
