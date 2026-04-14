import {
  createStoreService,
  getMyStore,
  getStoreDetail,
  editStore,
  myStoreProducts,
  favoriteStoreRegister,
  favoriteStoreDelete,
} from '../../services/store.service';
import { StoreRepository } from '../../repositories/store.repository';
import * as imageService from '../../services/image.service';

// 리포지토리 및 S3 모킹
jest.mock('../../repositories/store.repository');
jest.mock('../../services/image.service', () => ({
  uploadImage: jest.fn(),
  deleteFromS3: jest.fn(),
}));

describe('스토어 서비스 유닛 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. createStoreService (스토어 등록)
  // ==========================================
  describe('createStoreService', () => {
    const validData = {
      name: '테스트 스토어',
      address: '서울시',
      detailAddress: '101호',
      phoneNumber: '010-1234-5678',
      content: '옷 파는 곳입니다.',
    };

    it('판매자 권한이 아니면 에러를 던져야 한다', async () => {
      await expect(
        createStoreService('user-1', 'BUYER', validData),
      ).rejects.toThrow('판매자 권한이 필요합니다.');
    });

    it('이미 스토어가 존재하면 에러를 던져야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue({
        id: 'store-1',
      });

      await expect(
        createStoreService('user-1', 'SELLER', validData),
      ).rejects.toThrow('스토어가 이미 존재합니다.');
    });

    it('전화번호가 중복되면 에러를 던져야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue({
        id: 'other-store',
      });

      await expect(
        createStoreService('user-1', 'SELLER', validData),
      ).rejects.toThrow('이미 등록된 전화번호입니다');
    });

    it('정상 데이터가 주어지면 하이픈이 제거된 번호로 생성해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue(null);

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: 'http://s3.url/image.png',
      });
      (StoreRepository.createStore as jest.Mock).mockResolvedValue({
        id: 'new-store-1',
        ...validData,
        phoneNumber: '01012345678',
        image: 'http://s3.url/image.png',
      });

      const result = await createStoreService(
        'user-1',
        'SELLER',
        validData,
        mockFile,
      );

      expect(StoreRepository.createStore).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ phoneNumber: '01012345678' }),
      );
      expect(result).toHaveProperty('id', 'new-store-1');
    });
  });

  // ==========================================
  // 2. getMyStore (내 스토어 상세 조회)
  // ==========================================
  describe('getMyStore', () => {
    it('판매자가 아니면 에러를 던져야 한다', async () => {
      await expect(getMyStore('user-1', 'BUYER')).rejects.toThrow(
        '판매자 권한이 필요합니다.',
      );
    });

    it('생성한 스토어가 없으면 에러를 던져야 한다', async () => {
      (StoreRepository.getMyStoreDetail as jest.Mock).mockResolvedValue(null);

      await expect(getMyStore('user-1', 'SELLER')).rejects.toThrow(
        '존재하지 않는 스토어 입니다.',
      );
    });

    it('정상적으로 내 스토어 정보를 반환해야 한다', async () => {
      const mockStoreData = {
        id: 'store-1',
        name: '내 스토어',
        phoneNumber: '01012345678',
      };
      (StoreRepository.getMyStoreDetail as jest.Mock).mockResolvedValue(
        mockStoreData,
      );

      const result = await getMyStore('user-1', 'SELLER');
      expect(result.id).toBe('store-1');
    });
  });

  // ==========================================
  // 3. getStoreDetail (스토어 상세 조회)
  // ==========================================
  describe('getStoreDetail', () => {
    it('스토어가 존재하지 않으면 에러를 던져야 한다', async () => {
      (StoreRepository.getStoreDetail as jest.Mock).mockResolvedValue(null);

      await expect(getStoreDetail('invalid-id')).rejects.toThrow(
        '존재하지 않는 스토어 입니다.',
      );
    });

    it('정상적으로 스토어 정보를 반환해야 한다', async () => {
      const mockStoreData = {
        id: 'store-123',
        name: '스토어',
        phoneNumber: '01012345678',
      };
      (StoreRepository.getStoreDetail as jest.Mock).mockResolvedValue(
        mockStoreData,
      );

      const result = await getStoreDetail('store-123');
      expect(result.id).toBe('store-123');
    });
  });

  // ==========================================
  // 4. editStore (스토어 수정)
  // ==========================================
  describe('editStore', () => {
    const updateData = {
      name: '수정된 스토어',
      address: '서울시',
      detailAddress: '202호',
      phoneNumber: '010-9999-8888',
      content: '설명 수정됨',
    };

    it('판매자가 아니면 에러를 던져야 한다', async () => {
      await expect(
        editStore('user-1', 'BUYER', 'store-1', updateData),
      ).rejects.toThrow('판매자 권한이 필요합니다.');
    });

    it('본인의 스토어가 아니면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'other-user',
      });

      await expect(
        editStore('user-1', 'SELLER', 'store-1', updateData),
      ).rejects.toThrow('본인의 스토어만 수정할 수 있습니다.');
    });

    it('전화번호가 중복되면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'user-1',
      });
      // 내 스토어가 아닌 다른 스토어가 번호를 쓰고 있음
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue({
        id: 'other-store',
      });

      await expect(
        editStore('user-1', 'SELLER', 'store-1', updateData),
      ).rejects.toThrow('이미 등록된 전화번호입니다');
    });

    it('새 이미지가 업로드되면 기존 이미지를 S3에서 삭제하고 수정해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'user-1',
        image: 'old-image.png',
      });
      (StoreRepository.findByPhoneNumber as jest.Mock).mockResolvedValue(null);

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      (imageService.uploadImage as jest.Mock).mockResolvedValue({
        url: 'new-image.png',
      });
      (StoreRepository.updateStore as jest.Mock).mockResolvedValue({
        id: 'store-1',
        phoneNumber: '01099998888',
      });

      await editStore('user-1', 'SELLER', 'store-1', updateData, mockFile);

      expect(imageService.uploadImage).toHaveBeenCalled();
      expect(imageService.deleteFromS3).toHaveBeenCalledWith('old-image.png'); // 기존 이미지 삭제 로직 검증
      expect(StoreRepository.updateStore).toHaveBeenCalledWith(
        'store-1',
        expect.objectContaining({
          phoneNumber: '01099998888',
          image: 'new-image.png',
        }),
      );
    });
  });

  // ==========================================
  // 5. myStoreProducts (내 스토어 등록 상품 조회)
  // ==========================================
  describe('myStoreProducts', () => {
    it('판매자가 아니면 에러를 던져야 한다', async () => {
      await expect(
        myStoreProducts({
          page: 1,
          pageSize: 10,
          userId: 'user-1',
          userType: 'BUYER',
        }),
      ).rejects.toThrow('판매자 권한이 필요합니다.');
    });

    it('스토어가 없으면 에러를 던져야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        myStoreProducts({
          page: 1,
          pageSize: 10,
          userId: 'user-1',
          userType: 'SELLER',
        }),
      ).rejects.toThrow('존재하지 않는 스토어입니다.');
    });

    it('정상적으로 리스트와 총 개수를 반환해야 한다', async () => {
      (StoreRepository.findByUserId as jest.Mock).mockResolvedValue({
        id: 'store-1',
      });
      (StoreRepository.findMyStoreProducts as jest.Mock).mockResolvedValue({
        totalCount: 1,
        list: [
          {
            id: 'prod-1',
            name: '상품',
            price: 1000,
            stocks: [{ quantity: 10 }],
          },
        ],
      });

      const result = await myStoreProducts({
        page: 1,
        pageSize: 10,
        userId: 'user-1',
        userType: 'SELLER',
      });

      expect(result.totalCount).toBe(1);
      expect(result.list[0]?.id).toBe('prod-1'); // DTO 매핑 확인
    });
  });

  // ==========================================
  // 6. favoriteStoreRegister (관심 스토어 등록)
  // ==========================================
  describe('favoriteStoreRegister', () => {
    it('본인의 스토어를 등록하려 하면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'user-1',
      });

      await expect(favoriteStoreRegister('user-1', 'store-1')).rejects.toThrow(
        '본인의 스토어를 등록할 수 없습니다',
      );
    });

    it('이미 관심 스토어로 등록되어 있으면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'other',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue({
        id: 'fav-1',
      });

      await expect(favoriteStoreRegister('user-1', 'store-1')).rejects.toThrow(
        '이미 관심 스토어로 등록되어 있습니다.',
      );
    });

    it('정상 등록 시 register 타입을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
        userId: 'other',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue(null);
      (StoreRepository.favoriteStoreRegister as jest.Mock).mockResolvedValue({
        store: { id: 'store-1', phoneNumber: '01011112222' },
      });

      const result = await favoriteStoreRegister('user-1', 'store-1');
      expect(result.type).toBe('register');
    });
  });

  // ==========================================
  // 7. favoriteStoreDelete (관심 스토어 해제)
  // ==========================================
  describe('favoriteStoreDelete', () => {
    it('존재하지 않는 스토어면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue(null);

      await expect(favoriteStoreDelete('user-1', 'invalid')).rejects.toThrow(
        '존재하지 않는 스토어입니다.',
      );
    });

    it('관심 스토어로 등록되어 있지 않으면 에러를 던져야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue(null);

      await expect(favoriteStoreDelete('user-1', 'store-1')).rejects.toThrow(
        '관심 스토어로 등록되어 있지 않습니다.',
      );
    });

    it('정상 해제 시 delete 타입을 반환해야 한다', async () => {
      (StoreRepository.findByStoreId as jest.Mock).mockResolvedValue({
        id: 'store-1',
      });
      (StoreRepository.findFavorite as jest.Mock).mockResolvedValue({
        id: 'fav-1',
      });
      (StoreRepository.favoriteStoreDelete as jest.Mock).mockResolvedValue({
        store: { id: 'store-1', phoneNumber: '01011112222' },
      });

      const result = await favoriteStoreDelete('user-1', 'store-1');
      expect(result.type).toBe('delete');
    });
  });
});
