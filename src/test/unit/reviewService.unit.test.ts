import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/errors';
import { ReivewResponseDto } from '../../models/review.model';

import { reviewRepository } from '../../repositories/review.repository';
import {
  createReview,
  deleteReview,
  getProductReviewsList,
  getReviewDetail,
  updateReview,
} from '../../services/review.service';

//리포지토리 모킹
jest.mock('../../repositories/review.repository');

describe('리뷰 서비스 유닛 테스트', () => {
  // 모든 테스트 전 호출 횟수 및 Mock 상태 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // ==========================================
  // 1. createReview (리뷰 등록)
  // ==========================================
  describe('createReview ', () => {
    const mockUserId = 'user-123';
    const mockProductId = 'product-999';
    const mockReviewData = {
      rating: 5,
      content: '너무 마음에 듭니다!',
      orderItemId: 'orderItem-777',
    };

    it(' 구매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        createReview(mockUserId, 'SELLER', mockProductId, mockReviewData),
      ).rejects.toThrow(ForbiddenError);
    });

    it('주문 항목이 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      // 주문 내역 못 찾음 (null 반환)
      (reviewRepository.findOrderItemForReview as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        createReview(mockUserId, 'BUYER', mockProductId, mockReviewData),
      ).rejects.toThrow(NotFoundError);
    });

    it('본인이 구매한 상품이 아니면 ForbiddenError를 던져야 한다', async () => {
      (reviewRepository.findOrderItemForReview as jest.Mock).mockResolvedValue({
        id: mockReviewData.orderItemId,
        productId: mockProductId,
        order: { userId: 'other-user' },
      });

      await expect(
        createReview(mockUserId, 'BUYER', mockProductId, mockReviewData),
      ).rejects.toThrow(ForbiddenError);
    });

    it('리뷰하려는 상품과 주문한 상품이 다르면 BadRequestError를 던져야 한다', async () => {
      (reviewRepository.findOrderItemForReview as jest.Mock).mockResolvedValue({
        id: mockReviewData.orderItemId,
        productId: 'wrong-product', // 요청한 mockProductId와 다름
        order: { userId: mockUserId },
      });

      await expect(
        createReview(mockUserId, 'BUYER', mockProductId, mockReviewData),
      ).rejects.toThrow(BadRequestError);
    });

    it('이미 작성된 리뷰가 존재하면 ConflictError를 던져야 한다', async () => {
      (reviewRepository.findOrderItemForReview as jest.Mock).mockResolvedValue({
        id: mockReviewData.orderItemId,
        productId: mockProductId,
        order: { userId: mockUserId },
      });
      (reviewRepository.findReviewByOrderItemId as jest.Mock).mockResolvedValue(
        {
          id: 'existing-review-id',
        },
      );

      await expect(
        createReview(mockUserId, 'BUYER', mockProductId, mockReviewData),
      ).rejects.toThrow(ConflictError);
    });

    it('모든 조건을 만족하면 리뷰를 생성하고 DTO를 반환해야 한다', async () => {
      (reviewRepository.findOrderItemForReview as jest.Mock).mockResolvedValue({
        id: mockReviewData.orderItemId,
        productId: mockProductId,
        order: { userId: mockUserId },
      });

      (reviewRepository.findReviewByOrderItemId as jest.Mock).mockResolvedValue(
        null,
      );

      // 새 리뷰 저장 성공 시 반환될 가짜 데이터
      const savedReview = {
        id: 'new-review-id',
        userId: mockUserId,
        productId: mockProductId,
        content: mockReviewData.content,
        rating: mockReviewData.rating,
        orderItemId: mockReviewData.orderItemId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (reviewRepository.createReview as jest.Mock).mockResolvedValue(
        savedReview,
      );

      // 실행
      const result = await createReview(
        mockUserId,
        'BUYER',
        mockProductId,
        mockReviewData,
      );

      // 검증
      expect(reviewRepository.createReview).toHaveBeenCalledTimes(1);
      expect(reviewRepository.createReview).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
        mockReviewData,
      );
      expect(result).toBeInstanceOf(ReivewResponseDto);
      expect(result.id).toBe('new-review-id');
    });
  });
  // ==========================================
  // 2. getProductReviewsList (상품 리뷰 목록 조회)
  // ==========================================
  describe('getProductReviewsList', () => {
    const mockProductId = 'product-123';

    it('존재하지 않는 상품이면 NotFoundError를 던져야 한다', async () => {
      // 상품 존재 확인 시 false 반환
      (reviewRepository.checkProductExists as jest.Mock).mockResolvedValue(
        false,
      );

      await expect(getProductReviewsList(mockProductId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('상품이 존재하면 리뷰 목록과 메타데이터를 반환해야 한다', async () => {
      (reviewRepository.checkProductExists as jest.Mock).mockResolvedValue(
        true,
      );

      const mockItems = [
        {
          id: 'rev-1',
          content: '좋아요',
          rating: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { name: '유저1' },
        },
        {
          id: 'rev-2',
          content: '보통',
          rating: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { name: '유저2' },
        },
      ];
      (reviewRepository.findReviewsByProductId as jest.Mock).mockResolvedValue({
        items: mockItems,
        total: 10, // 전체 10개 중 2개만 가져온 상황 가정
      });

      const result = await getProductReviewsList(mockProductId, '1', '2');

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.hasNextPage).toBe(true); // 10 > 1 * 2 이므로
    });
  });

  // ==========================================
  // 3. getReviewDetail (리뷰 상세 조회)
  // ==========================================
  describe('getReviewDetail', () => {
    const mockReviewId = 'review-123';
    const mockUserId = 'user-123';

    it('구매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        getReviewDetail(mockReviewId, mockUserId, 'SELLER'),
      ).rejects.toThrow(ForbiddenError);
    });

    it('리뷰가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (reviewRepository.findReviewDetailById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        getReviewDetail(mockReviewId, mockUserId, 'BUYER'),
      ).rejects.toThrow(NotFoundError);
    });

    it('본인이 작성한 리뷰가 아니면 ForbiddenError를 던져야 한다', async () => {
      (reviewRepository.findReviewDetailById as jest.Mock).mockResolvedValue({
        id: mockReviewId,
        userId: 'other-user',
      });

      await expect(
        getReviewDetail(mockReviewId, mockUserId, 'BUYER'),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ==========================================
  // 4. updateReview & deleteReview (수정 및 삭제)
  // ==========================================
  // 수정과 삭제는 로직이 비슷하므로 묶어서 관리
  describe('updateReview', () => {
    const mockReviewId = 'review-123';
    const mockUserId = 'user-123';
    const updateData = { content: '수정된 내용', rating: 4 };

    it('구매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        updateReview(mockReviewId, mockUserId, 'SELLER', updateData),
      ).rejects.toThrow(ForbiddenError);
    });

    it('리뷰가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (reviewRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        updateReview(mockReviewId, mockUserId, 'BUYER', updateData),
      ).rejects.toThrow(NotFoundError);
    });

    it('본인이 아니면 수정 시 ForbiddenError를 던져야 한다', async () => {
      (reviewRepository.findById as jest.Mock).mockResolvedValue({
        id: mockReviewId,
        userId: 'other-user',
      });

      await expect(
        updateReview(mockReviewId, mockUserId, 'BUYER', updateData),
      ).rejects.toThrow(ForbiddenError);
    });

    it('모든 조건 만족 시 수정을 호출하고 DTO를 반환해야 한다', async () => {
      (reviewRepository.findById as jest.Mock).mockResolvedValue({
        id: mockReviewId,
        userId: mockUserId,
      });
      (reviewRepository.updateReview as jest.Mock).mockResolvedValue({
        id: mockReviewId,
        ...updateData,
      });

      const result = await updateReview(
        mockReviewId,
        mockUserId,
        'BUYER',
        updateData,
      );

      expect(reviewRepository.updateReview).toHaveBeenCalledWith(
        mockReviewId,
        updateData,
      );
      expect(result.id).toBe(mockReviewId);
    });
  });

  describe('deleteReview', () => {
    const mockReviewId = 'review-123';
    const mockUserId = 'user-123';

    it('구매자가 아니면 ForbiddenError를 던져야 한다', async () => {
      await expect(
        deleteReview(mockReviewId, mockUserId, 'SELLER'),
      ).rejects.toThrow(ForbiddenError);
    });

    it('리뷰가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (reviewRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteReview(mockReviewId, mockUserId, 'BUYER'),
      ).rejects.toThrow(NotFoundError);
    });

    it('성공적으로 삭제 처리를 해야 한다', async () => {
      (reviewRepository.findById as jest.Mock).mockResolvedValue({
        id: mockReviewId,
        userId: mockUserId,
      });

      await deleteReview(mockReviewId, mockUserId, 'BUYER');

      expect(reviewRepository.deleteReview).toHaveBeenCalledWith(mockReviewId);
      expect(reviewRepository.deleteReview).toHaveBeenCalledTimes(1);
    });
  });
});
