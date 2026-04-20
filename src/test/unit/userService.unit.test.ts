import * as userService from '../../services/user.service';
import * as userRepository from '../../repositories/user.repository';
import * as passwordUtil from '../../utils/password.util';
import { ConflictError } from '../../errors/errors';
import * as imageService from '../../services/image.service';

// 의존성 모킹
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/password.util');
jest.mock('../../services/image.service');

// 회원 가입
describe('User Service Unit Test - register()', () => {
  const registerData: any = {
    email: 'test@test.com',
    password: 'password123!',
    name: '테스터',
    type: 'BUYER',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    expect(userRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
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
