// 비즈니스 로직, HTTP 요청 없이
// Utility 함수가 제대로 작동하는지만
import { comparePassword, hashPassword } from '../../utils/password.util';

describe('Auth Unit Test - Utils', () => {
  it('✅ 비밀번호 해싱 및 비교가 정상적으로 이루어져야 한다', async () => {
    const password = 'password123!';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('❌ 틀린 비밀번호 비교 시 false를 반환해야 한다', async () => {
    const hashedPassword = await hashPassword('correct-password');
    const isMatch = await comparePassword('wrong-password', hashedPassword);
    expect(isMatch).toBe(false);
  });
});
