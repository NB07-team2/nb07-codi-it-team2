import * as userService from '../../services/user.service';
import * as userRepository from '../../repositories/user.repository';
import * as passwordUtil from '../../utils/password.util';
import { ConflictError } from '../../errors/errors';
import * as imageService from '../../services/image.service';

// 의존성 모킹
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/password.util');
jest.mock('../../services/image.service');

describe('User Service Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 회원 가입
  describe('User Service Unit Test - register()', () => {
    const registerData: any = {
      email: 'test@test.com',
      password: 'password123!',
      name: '테스터',
      type: 'BUYER',
    };

    it('✅ 새로운 유저 정보를 입력하면 비밀번호를 암호화하여 저장해야 한다', async () => {
      // 중복 유저 없음 설정
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      // 비밀번호 암호화 결과 가짜 설정
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue(
        'hashed_password',
      );
      // 생성된 유저 결과 가짜 설정 ( grade 필수 )
      const mockUser = {
        ...registerData,
        id: 'uuid-123',
        password: 'hashed_password',
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: 'default.png',
        grade: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
      };
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.register(registerData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith(
        registerData.password,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: 'hashed_password',
        name: registerData.name,
        type: registerData.type,
      });
      expect(result.email).toBe(registerData.email);
    });

    it('❌ 이미 존재하는 이메일일 경우 ConflictError를 던져야 한다', async () => {
      // 이미 존재하는 유저 반환 설정
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'existing',
      });

      await expect(userService.register(registerData)).rejects.toThrow(
        new ConflictError('이미 존재하는 유저입니다.'),
      );
    });
  });

  // 내 정보 조회
  describe('getMe()', () => {
    it('✅ 존재하는 유저 ID를 입력하면 유저 정보를 반환해야 한다', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        name: '테스터',
        type: 'BUYER',
        points: 0,
        grade: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
      };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getMe('user-123');

      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result.id).toBe('user-123');
    });

    it('❌ 존재하지 않는 유저 ID일 경우 NotFoundError를 던져야 한다', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getMe('non-existent')).rejects.toThrow(
        '유저를 찾을 수 없습니다.',
      );
    });
  });

  // 내 정보 수정
  describe('updateMe()', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      password: 'hashed_current_password',
      image: 'old_image.png',
    };

    it('✅ 이름과 비밀번호를 수정하고, 이미지를 새로 업로드하면 기존 이미지를 삭제하고 성공해야 한다', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue(
        'new_hashed_password',
      );
      (userRepository.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: '새이름',
        image: 'new_image.png',
        grade: { name: 'Green' },
      });

      const updateData = {
        name: '새이름',
        password: 'new_password!',
        currentPassword: 'current_password!',
        image: 'new_image.png',
      };

      await userService.updateMe(userId, updateData);

      expect(passwordUtil.comparePassword).toHaveBeenCalled();
      expect(imageService.deleteFromS3).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('❌ 현재 비밀번호가 틀리면 InvalidCredentialsError를 던져야 한다', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.updateMe(userId, { currentPassword: 'wrong' }),
      ).rejects.toThrow();
    });
  });

  // 관심 스토어 조회
  describe('getFavorites()', () => {
    const userId = 'user-123';

    it('✅ 관심 스토어 목록이 있으면 가공된 스토어 정보를 반환해야 한다', async () => {
      const mockFavorites = [
        {
          storeId: 'store-1',
          userId,
          store: {
            id: 'store-1',
            name: '관심 맛집',
            image: 'store.png',
            address: '서울시',
            phoneNumber: '01011112222',
          },
        },
      ];

      (userRepository.findById as jest.Mock).mockResolvedValue({ id: userId });
      (userRepository.findFavoritesByUserId as jest.Mock).mockResolvedValue(
        mockFavorites,
      );

      const result = await userService.getFavorites(userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.store.name).toBe('관심 맛집');
      expect(result[0]).toHaveProperty('storeId');
    });

    it('❌ 유저가 존재하지 않으면 NotFoundError를 던져야 한다', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getFavorites(userId)).rejects.toThrow(
        '유저를 찾을 수 없습니다.',
      );
    });
  });

  // 회원 탈퇴
  describe('deleteMe()', () => {
    const userId = 'user-123';

    it('✅ 탈퇴 시 기본 이미지가 아니면 S3에서 이미지를 삭제하고 유저를 삭제해야 한다', async () => {
      const mockUser = {
        id: userId,
        image: 'https://codi-it-s3.amazonaws.com/custom-image.png',
      };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      await userService.deleteMe(userId);

      expect(imageService.deleteFromS3).toHaveBeenCalledWith(mockUser.image);
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });

    it('✅ 기본 이미지일 경우 S3 삭제를 호출하지 않고 유저만 삭제해야 한다', async () => {
      (imageService.deleteFromS3 as jest.Mock).mockClear();

      const mockUser = {
        id: userId,
        image:
          'https://codi-it-s3.s3.amazonaws.com/others/b7220551-54e3-414f-bed1-801a44e71d45.png',
      };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      await userService.deleteMe(userId);

      // 0번 호출되었는지 확인
      expect(imageService.deleteFromS3).not.toHaveBeenCalled();
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
