import * as authService from '../../../services/auth.service';
import * as jwtUtil from '../../../utils/jwt.util';

// 의존성을 가지는 모듈을 가짜로 생성
jest.mock('../../../utils/jwt.util');

// refreshToken으로 AccessToken 재발급하는 로직 단위 테스트
describe('Auth Service Unit Test - refreshTokens & logout', () => {
  const mockToken = 'valid.token.test';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 토큰 재발급 로직 테스트
  describe('refreshTokens()', () => {
    it('✅ 유효한 Refresh 토큰이 주어지면 새로운 토큰 세트를 반환해야 한다', async () => {
      (jwtUtil.verifyRefreshToken as jest.Mock).mockReturnValue({
        valid: true,
        payload: { userId: 'user-123', type: 'BUYER' },
      });
      (jwtUtil.generateAccessToken as jest.Mock).mockReturnValue(
        'new-access-token',
      );
      (jwtUtil.generateRefreshToken as jest.Mock).mockReturnValue(
        'new-refresh-token',
      );

      const result = await authService.refreshTokens(mockToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(jwtUtil.verifyRefreshToken).toHaveBeenCalledWith(mockToken);
    });

    it('❌ 유효하지 않거나 만료된 Refresh Token일 경우 UnauthorizedError를 던져야 한다', async () => {
      (jwtUtil.verifyRefreshToken as jest.Mock).mockReturnValue({
        valid: false,
        expired: false,
      });

      await expect(authService.refreshTokens('fake-token')).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  // 2. 로그아웃 로직 테스트
  describe('logout()', () => {
    it('✅ 유효한 userId로 로그아웃 시 에러 없이 종료되어야 한다', async () => {
      await expect(authService.logout('user-123')).resolves.not.toThrow();
    });
  });
});
