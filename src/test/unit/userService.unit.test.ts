import * as userService from '../../services/user.service';
import * as userRepository from '../../repositories/user.repository';
import * as passwordUtil from '../../utils/password.util';
import { ConflictError } from '../../errors/errors';

// 의존성 모킹
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/password.util');

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
