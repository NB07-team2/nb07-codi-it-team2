import {z} from 'zod';

export const inquiryCreateSchema = z.object({
  productId: z.string().min(1, '상품 ID는 필수입니다.'),
  userId: z.string().min(1, '사용자 ID는 필수입니다.'),
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().min(1, '내용은 필수입니다.'),
  isSecret: z.boolean().default(false),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;