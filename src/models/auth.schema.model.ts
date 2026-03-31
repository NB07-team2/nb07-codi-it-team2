import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: '비밀번호는 영문 대소문자와 숫자를 포함해야 합니다',
    }),
  name: z
    .string()
    .min(2, { message: '이름은 최소 2자 이상이어야 합니다' })
    .max(50, { message: '이름은 최대 50자까지 입력 가능합니다' }),
  profileImage: z.string().nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh Token을 입력해주세요' }),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
