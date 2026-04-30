import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import productRouter from '../../routes/product.route';
import * as productService from '../../services/product.service';

// 스키마 통과용 가짜 ID
const MOCK_CUID = 'cjld2cjxh0000qzrmn831i7rn';

jest.mock('../../middlewares/auth.middlewares', () => ({
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: 'test-seller-id', type: 'SELLER' };
    next();
  },
}));

jest.mock('../../services/image.service', () => {
  const multer = require('multer');
  return {
    upload: multer({ storage: multer.memoryStorage() }),
    uploadImage: jest.fn(),
    deleteFromS3: jest.fn(),
  };
});

jest.mock('../../services/product.service');

const app = express();
app.use(express.json());
app.use('/api/products', productRouter);

// 에러 로그 확인
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

describe('Product API Endpoints Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 상품 생성
  describe('POST /api/products', () => {
    it('유효한 데이터로 상품 생성 시 201을 반환해야 한다', async () => {
      (productService.createProduct as jest.Mock).mockResolvedValue({
        id: MOCK_CUID,
      });

      const res = await request(app)
        .post('/api/products')
        .field('name', '테스트 상품')
        .field('price', '10000')
        .field('content', '상품 설명입니다 10자 이상.')
        .field('categoryName', 'top')
        .field('stocks', JSON.stringify([{ sizeId: 1, quantity: 10 }]))
        .attach('image', Buffer.from('data'), 'test.png');

      expect(res.status).toBe(201);
    });
  });

  // 상품 목록 조회
  describe('GET /api/products', () => {
    it('200 상태코드와 데이터를 반환해야 한다', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue({
        list: [],
        totalCount: 0,
      });

      const res = await request(app)
        .get('/api/products')
        .query({ page: 1, pageSize: 16 });

      expect(res.status).toBe(200);
    });
  });

  // 상품 삭제
  describe('DELETE /api/products/:productId', () => {
    it('성공 시 204 상태코드를 반환해야 한다', async () => {
      (productService.deleteProduct as jest.Mock).mockResolvedValue({
        message: '삭제됨',
      });

      const res = await request(app).delete(`/api/products/${MOCK_CUID}`);

      expect(res.status).toBe(204);
    });
  });

  // 수정 실패 케이스
  describe('PATCH /api/products/:productId (실패)', () => {
    it('권한이 없는 유저가 수정을 시도하면 403을 반환해야 한다', async () => {
      (productService.updateProduct as jest.Mock).mockRejectedValue({
        status: 403,
        message: '자신의 스토어 상품만 수정할 수 있습니다.',
      });

      const res = await request(app)
        .patch(`/api/products/${MOCK_CUID}`)
        .send({ name: '해킹 시도' });

      expect(res.status).toBe(403);
    });
  });

  // 상세조회 실패 케이스
  describe('GET /api/products/:productId (실패)', () => {
    it('상품이 존재하지 않으면 404를 반환해야 한다', async () => {
      (productService.getProductDetail as jest.Mock).mockRejectedValue({
        status: 404,
        message: '요청하신 상품을 찾을 수 없습니다.',
      });

      const res = await request(app).get(`/api/products/${MOCK_CUID}`);

      expect(res.status).toBe(404);
    });
  });
});
