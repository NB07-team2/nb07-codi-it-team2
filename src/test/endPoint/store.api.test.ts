import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';
import { StoreRepository } from '../../repositories/store.repository';
import * as imageService from '../../services/image.service';

// 리포지토리 및 S3 모킹
jest.mock('../../repositories/store.repository');
jest.mock('../../services/image.service', () => {
  const originalModule = jest.requireActual('../../services/image.service');
  return {
    __esModule: true,
    ...originalModule,
    uploadImage: jest.fn(),
  };
});

describe('스토어 API 엔드포인트 테스트', () => {
  let sellerToken: string;
  let buyerToken: string;

  beforeAll(() => {
    // 판매자 토큰 생성
    sellerToken = jwt.sign(
      { userId: 'seller-user', type: 'SELLER' },
      process.env.JWT_SECRET || 'test_jwt_secret_over_32_characters_long_123',
      { expiresIn: '1h' },
    );
    // 구매자 토큰 생성
    buyerToken = jwt.sign(
      { userId: 'buyer-user', type: 'BUYER' },
      process.env.JWT_SECRET || 'test_jwt_secret_over_32_characters_long_123',
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. POST /api/stores (새 스토어 등록)
  // ==========================================
  describe('POST /api/stores', () => {
    const validStoreData = {
      name: '엔드포인트 스토어',
      address: '서울시 강남구',
      detailAddress: '101호',
      phoneNumber: '010-1111-2222',
      content: '테스트 설명입니다.',
    };

    it('SELLER 권한으로 정상 전송 시 201을 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue(null);
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: 'http://s3.url/image.png',
      });
      (StoreRepository.createStore as jest.Mock).mockResolvedValue({
        id: 'store-123',
        ...validStoreData,
      });

      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', validStoreData.name)
        .field('address', validStoreData.address)
        .field('detailAddress', validStoreData.detailAddress)
        .field('phoneNumber', validStoreData.phoneNumber)
        .field('content', validStoreData.content)
        .attach('image', Buffer.from('fake image'), 'store.png');

      expect(response.status).toBe(201);
    });

    it('로그인하지 않으면 401을 반환해야 한다', async () => {
      const response = await request(app)
        .post('/api/stores')
        .send(validStoreData);
      expect(response.status).toBe(401);
    });

    it('이미 스토어가 존재하면 409를 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue({
        id: 'existing-store',
      });

      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validStoreData);

      expect(response.status).toBe(409);
    });

    it('이미 있는 전화번호면 409를 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue({
        id: 'other-store',
      });

      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validStoreData);

      expect(response.status).toBe(409);
    });
    it('등록 시 이미지 필드에 파일이 아닌 텍스트를 보내면 400을 반환해야 한다', async () => {
      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: '잘못된 요청 스토어',
          address: '서울시',
          detailAddress: '101호',
          phoneNumber: '010-9999-9999',
          content: '설명',
          image: 'http://가짜-이미지-주소.com/image.png',
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // 2. PATCH /api/stores/:storeId (스토어 수정)
  // ==========================================
  describe('PATCH /api/stores/:storeId', () => {
    const validUpdateData = {
      name: '수정된 스토어',
      address: '서울시 서초구',
      detailAddress: '202호',
      phoneNumber: '010-3333-4444',
      content: '수정된 설명입니다.',
    };

    it('정상적으로 수정 시 200을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-123',
        userId: 'seller-user',
      });
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue(null);
      (StoreRepository.updateStore as jest.Mock).mockResolvedValue({
        id: 'store-123',
        ...validUpdateData,
      });

      const response = await request(app)
        .patch('/api/stores/store-123')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(200);
    });

    it('구매자가 접근 시 403을 반환해야 한다', async () => {
      const response = await request(app)
        .patch('/api/stores/store-123')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(403);
    });

    it('내 스토어가 아닌 다른 스토어 수정 시 403을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-123',
        userId: 'another-seller',
      });

      const response = await request(app)
        .patch('/api/stores/store-123')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(403);
    });

    it('전화번호 중복 시 409를 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-123',
        userId: 'seller-user',
      });
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue({
        id: 'other-store-id',
      }); // 내 스토어가 아닌 다른 스토어가 번호 사용 중

      const response = await request(app)
        .patch('/api/stores/store-123')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(409);
    });
    it('수정 시 이미지 필드에 파일이 아닌 텍스트를 보내면 400을 반환해야 한다', async () => {
      // 본인 스토어 권한 통과 모킹
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-123',
        userId: 'seller-user',
      });

      const response = await request(app)
        .patch('/api/stores/store-123')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          image: '파일 대신 텍스트 전송',
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // 3. GET /api/stores/:storeId (스토어 상세 조회) - 인증 불필요
  // ==========================================
  describe('GET /api/stores/:storeId', () => {
    it('정상 조회 시 200을 반환해야 한다', async () => {
      (StoreRepository.getStoreDetail as jest.Mock).mockResolvedValue({
        id: 'store-123',
        name: '스토어',
        phoneNumber: '01012345678',
      });

      const response = await request(app).get('/api/stores/store-123');
      expect(response.status).toBe(200);
    });

    it('스토어 아이디를 잘못 입력했거나 존재하지 않으면 404를 반환해야 한다', async () => {
      (StoreRepository.getStoreDetail as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/stores/invalid-id');
      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // 4. GET /api/stores/detail/my (내 스토어 상세 조회)
  // ==========================================
  describe('GET /api/stores/detail/my', () => {
    it('정상 조회 시 200을 반환해야 한다', async () => {
      (StoreRepository.getMyStoreDetail as jest.Mock).mockResolvedValue({
        id: 'my-store',
        totalSoldCount: 0,
        phoneNumber: '01012345678',
      });

      const response = await request(app)
        .get('/api/stores/detail/my')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
    });

    it('구매자가 접근 시 403을 반환해야 한다', async () => {
      const response = await request(app)
        .get('/api/stores/detail/my')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(403);
    });

    it('생성한 스토어가 없으면 404를 반환해야 한다', async () => {
      (StoreRepository.getMyStoreDetail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/stores/detail/my')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // 5. GET /api/stores/detail/my/product (내 스토어 등록 상품 조회)
  // ==========================================
  describe('GET /api/stores/detail/my/product', () => {
    it('정상 조회 시 200을 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue({
        id: 'my-store',
      });
      (StoreRepository.findMyStoreProducts as jest.Mock).mockResolvedValue({
        totalCount: 1,
        list: [{ id: 'prod-1' }],
      });

      const response = await request(app)
        .get('/api/stores/detail/my/product?page=1&pageSize=10')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
    });

    it('잘못된 파라미터 입력 시 400을 반환해야 한다', async () => {
      const response = await request(app)
        .get('/api/stores/detail/my/product?page=-1') // page가 1보다 작음 (Superstruct 에러)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(400);
    });

    it('스토어 비생성 판매자가 조회하면 404를 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/stores/detail/my/product')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(404);
    });

    it('구매자가 접근 시 403을 반환해야 한다', async () => {
      const response = await request(app)
        .get('/api/stores/detail/my/product')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ==========================================
  // 6. POST /api/stores/:storeId/favorite (관심 스토어 등록)
  // ==========================================
  describe('POST /api/stores/:storeId/favorite', () => {
    it('정상 등록 시 201을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-999',
        userId: 'other-seller',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue(null);
      (StoreRepository.favoriteStoreRegister as jest.Mock).mockResolvedValue({
        store: { id: 'store-999', phoneNumber: '01012345678' },
      });

      const response = await request(app)
        .post('/api/stores/store-999/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(201);
    });

    it('본인 스토어 등록 시 403을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-999',
        userId: 'seller-user',
      });

      const response = await request(app)
        .post('/api/stores/store-999/favorite')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(403);
    });

    it('파라미터 오류 또는 존재하지 않는 스토어면 404를 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/stores/invalid-store/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(404);
    });

    it('이미 관심 스토어에 등록되어 있으면 409를 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-999',
        userId: 'other-seller',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue({
        id: 'fav-1',
      }); // 이미 등록됨

      const response = await request(app)
        .post('/api/stores/store-999/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(409);
    });
  });

  // ==========================================
  // 7. DELETE /api/stores/:storeId/favorite (관심 스토어 해제)
  // ==========================================
  describe('DELETE /api/stores/:storeId/favorite', () => {
    it('정상 해제 시 200을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-999',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue({
        id: 'fav-1',
      });
      (StoreRepository.favoriteStoreDelete as jest.Mock).mockResolvedValue({
        store: { id: 'store-999', phoneNumber: '01012345678' },
      });

      const response = await request(app)
        .delete('/api/stores/store-999/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
    });

    it('존재하지 않는 스토어 해제 시 404를 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/stores/invalid-store/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(404);
    });

    it('관심 스토어가 아닌 스토어를 해제하려 하면 404를 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-999',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue(null); // 즐겨찾기 내역 없음

      const response = await request(app)
        .delete('/api/stores/store-999/favorite')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
