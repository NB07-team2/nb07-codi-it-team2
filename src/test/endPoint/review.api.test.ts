import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as ReviewService from '../../services/review.service';
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../errors/errors';

jest.mock('../../services/review.service');

describe('Review API Endpoint Tests', () => {
  let buyerToken: string;
  const SECRET =
    process.env.JWT_SECRET || 'test_jwt_secret_over_32_characters_long_123';

  beforeAll(() => {
    // 구매자 토큰 생성
    buyerToken = jwt.sign({ id: 'buyer-user', type: 'BUYER' }, SECRET, {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- 1. 리뷰 등록 (POST /api/product/:productId/reviews) ---
  describe('POST /api/product/:productId/reviews', () => {
    const validBody = {
      rating: 5,
      content: '정말 최고의 상품입니다!',
      orderItemId: 'item-123',
    };

    it('성공 시 201을 반환해야 한다 (인증된 구매자)', async () => {
      (ReviewService.createReview as jest.Mock).mockResolvedValue({
        id: 'rev-1',
      });

      const res = await request(app)
        .post('/api/product/prod-1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validBody);

      expect(res.status).toBe(201);
    });

    it('인증 토큰이 없으면 401 에러를 반환해야 한다', async () => {
      const res = await request(app)
        .post('/api/product/prod-1/reviews')
        .send(validBody);
      expect(res.status).toBe(401);
    });

    it('결제 완료 상태가 아니면 403 에러를 반환해야 한다', async () => {
      (ReviewService.createReview as jest.Mock).mockRejectedValue(
        new ForbiddenError(
          '결제가 완료된 상품에 대해서만 리뷰를 작성할 수 있습니다.',
        ),
      );

      const res = await request(app)
        .post('/api/product/prod-1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('이미 리뷰가 존재하면 409 에러를 반환해야 한다', async () => {
      (ReviewService.createReview as jest.Mock).mockRejectedValue(
        new ConflictError('이미 리뷰가 존재합니다.'),
      );

      const res = await request(app)
        .post('/api/product/prod-1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validBody);

      expect(res.status).toBe(409);
    });

    it('본인이 구매하지 않은 상품에 대해 작성을 시도하면 403 에러를 반환한다', async () => {
      (ReviewService.createReview as jest.Mock).mockRejectedValue(
        new ForbiddenError('본인이 구매한 상품만 작성 가능합니다.'),
      );

      const res = await request(app)
        .post('/api/product/prod-1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validBody);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('본인이 구매한 상품만 작성 가능합니다.');
    });

    it('주문한 상품과 리뷰를 작성하려는 상품이 일치하지 않으면 400 에러를 반환한다', async () => {
      (ReviewService.createReview as jest.Mock).mockRejectedValue(
        new BadRequestError(
          '주문한 상품과 리뷰를 작성하려는 상품이 일치하지 않습니다.',
        ),
      );

      const res = await request(app)
        .post('/api/product/mismatch-prod/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        '주문한 상품과 리뷰를 작성하려는 상품이 일치하지 않습니다.',
      );
    });
  });
  // ========================================================
  // 2. GET/api/product/:productId/reviews (상품 리뷰 목록 조회)
  // ========================================================
  describe('GET /api/product/:productId/reviews', () => {
    it('인증 없이도 200과 함께 목록을 반환해야 한다', async () => {
      (ReviewService.getProductReviewsList as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      const res = await request(app).get('/api/product/prod-1/reviews');
      expect(res.status).toBe(200);
    });

    it('존재하지 않는 상품 아이디인 경우 404를 반환해야 한다', async () => {
      (ReviewService.getProductReviewsList as jest.Mock).mockRejectedValue(
        new NotFoundError('존재하지 않는 상품입니다.'),
      );

      const res = await request(app).get('/api/product/non-exist/reviews');
      expect(res.status).toBe(404);
    });
  });

  // --- 3. 리뷰 상세 조회 (GET /api/review/:reviewId) ---
  describe('GET /api/review/:reviewId', () => {
    it('작성자 본인인 경우 200을 반환해야 한다', async () => {
      (ReviewService.getReviewDetail as jest.Mock).mockResolvedValue({
        id: 'rev-1',
      });

      const res = await request(app)
        .get('/api/review/rev-1')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
    });

    it('존재하지 않거나 잘못된 리뷰 아이디인 경우 404 에러를 반환한다', async () => {
      (ReviewService.getReviewDetail as jest.Mock).mockRejectedValue(
        new NotFoundError('리뷰를 찾을 수 없습니다.'),
      );

      const res = await request(app)
        .get('/api/review/wrong-id')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('리뷰를 찾을 수 없습니다.');
    });

    it('타인의 리뷰를 조회하려 하면 403을 반환해야 한다', async () => {
      (ReviewService.getReviewDetail as jest.Mock).mockRejectedValue(
        new ForbiddenError('본인이 작성한 리뷰만 조회할 수 있습니다.'),
      );

      const res = await request(app)
        .get('/api/review/rev-1')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // --- 4. 리뷰 수정 (PATCH /api/review/:reviewId) ---
  describe('PATCH /api/review/:reviewId', () => {
    const updateBody = { content: '수정된 리뷰 내용입니다. 10자 이상 채우기.' };

    it('내용이 없는 요청인 경우 403 에러를 반환해야 한다', async () => {
      const res = await request(app)
        .patch('/api/review/rev-1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('수정할 내용이 없습니다.');
    });

    it('성공 시 200을 반환해야 한다', async () => {
      (ReviewService.updateReview as jest.Mock).mockResolvedValue({
        id: 'rev-1',
      });

      const res = await request(app)
        .patch('/api/review/rev-1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateBody);

      expect(res.status).toBe(200);
    });

    it('수정 시 리뷰를 찾을 수 없으면 404 에러를 반환한다', async () => {
      (ReviewService.updateReview as jest.Mock).mockRejectedValue(
        new NotFoundError('리뷰를 찾을 수 없습니다.'),
      );

      const res = await request(app)
        .patch('/api/review/non-exist')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('리뷰를 찾을 수 없습니다.');
    });

    it('본인이 작성하지 않은 리뷰를 수정하려 하면 403 에러를 반환한다', async () => {
      (ReviewService.updateReview as jest.Mock).mockRejectedValue(
        new ForbiddenError('본인이 작성한 리뷰만 수정할 수 있습니다.'),
      );

      const res = await request(app)
        .patch('/api/review/not-mine')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateBody);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('본인이 작성한 리뷰만 수정할 수 있습니다.');
    });
  });

  // --- 5. 리뷰 삭제 (DELETE /api/review/:reviewId) ---
  describe('DELETE /api/review/:reviewId', () => {
    it('성공 시 204를 반환해야 한다', async () => {
      (ReviewService.deleteReview as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/review/rev-1')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(204);
    });

    it('리뷰가 존재하지 않으면 404를 반환해야 한다', async () => {
      (ReviewService.deleteReview as jest.Mock).mockRejectedValue(
        new NotFoundError('리뷰를 찾을 수 없습니다.'),
      );

      const res = await request(app)
        .delete('/api/review/non-exist')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });

    it('본인이 작성하지 않은 리뷰를 삭제하려 하면 403 에러를 반환한다', async () => {
      (ReviewService.deleteReview as jest.Mock).mockRejectedValue(
        new ForbiddenError('본인이 작성한 리뷰만 삭제할 수 있습니다.'),
      );

      const res = await request(app)
        .delete('/api/review/not-mine')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('본인이 작성한 리뷰만 삭제할 수 있습니다.');
    });
  });
});
