import { z } from 'zod';
import { UserType } from '@prisma/client';

export const registerSchema = z.object({
  email: z
    .string()
    .email({ message: '올바른 이메일 형식이 아닙니다' })
    .regex(/^[^A-Z]*$/, { message: '이메일은 소문자만 입력 가능합니다' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' }),
  name: z
    .string()
    .min(2, { message: '이름은 최소 2자 이상이어야 합니다' })
    .max(50, { message: '이름은 최대 50자까지 입력 가능합니다' }),
  image: z
    .string()
    .nullish()
    .transform((val) => val ?? undefined),
  type: z.nativeEnum(UserType).describe('회원 유형을 입력해주세요'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: '올바른 이메일 형식이 아닙니다' })
    .regex(/^[^A-Z]*$/, { message: '이메일은 소문자만 입력 가능합니다' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh Token을 입력해주세요' }),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
