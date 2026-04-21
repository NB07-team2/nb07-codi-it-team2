import * as authController from '../../../controllers/auth.controller';
import * as authService from '../../../services/auth.service';
// ✅ 1. constants를 객체 형태로 가져옵니다 (조작을 위해)
import * as constants from '../../../utils/constants.util';

// 의존성 모킹
jest.mock('../../../services/auth.service');

// ✅ 2. constants.util 모킹 (원본은 유지하되 NODE_ENV만 조작 가능하게 설정)
jest.mock('../../../utils/constants.util', () => ({
  __esModule: true,
  ...jest.requireActual('../../../utils/constants.util'),
  NODE_ENV: 'development', // 기본값 설정
}));

describe('Auth Controller - Cookie Settings Test', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      body: { email: 'test@test.com', password: 'password123!' },
    };
    mockResponse = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('✅ NODE_ENV가 production일 때 secure: true, sameSite: none이어야 한다', async () => {
    // ✅ 3. 상수를 강제로 'production'으로 덮어씁니다 (as any로 타입 체크 우회)
    (constants as any).NODE_ENV = 'production';

    (authService.login as jest.Mock).mockResolvedValue({
      response: { accessToken: 'at' },
      refreshToken: 'rt',
    });

    await authController.login(mockRequest, mockResponse);

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      constants.REFRESH_TOKEN_COOKIE_NAME,
      'rt',
      expect.objectContaining({
        secure: true,
        sameSite: 'none',
      }),
    );
  });

  it('✅ NODE_ENV가 development일 때 secure: false, sameSite: lax이어야 한다', async () => {
    // ✅ 4. 다시 'development'로 덮어씁니다.
    (constants as any).NODE_ENV = 'development';

    (authService.login as jest.Mock).mockResolvedValue({
      response: { accessToken: 'at' },
      refreshToken: 'rt',
    });

    await authController.login(mockRequest, mockResponse);

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      constants.REFRESH_TOKEN_COOKIE_NAME,
      'rt',
      expect.objectContaining({
        secure: false,
        sameSite: 'lax',
      }),
    );
  });
});
