import {z} from 'zod';

export const inquiryCreateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(100, '제목은 최대 100자까지 입력 가능합니다.'),
  content: z.string().min(1, '내용은 필수입니다.').max(1000, '내용은 최대 1000자까지 입력 가능합니다.'),
  isSecret: z.boolean().default(false),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;