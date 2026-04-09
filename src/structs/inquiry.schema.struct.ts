import {
  object,
  string,
  defaulted,
  coerce,
  integer,
  min,
  optional,
  enums,
} from 'superstruct';

import {z} from 'zod';

export const inquiryCreateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(20, '제목은 최대 20자까지 입력 가능합니다.'),
  content: z.string().min(1, '내용은 필수입니다.').max(1000, '내용은 최대 1000자까지 입력 가능합니다.'),
  isSecret: z.boolean().default(false),
  productId: z.string().min(1, '상품 ID는 필수입니다.'),
  userId: z.string().min(1, '사용자 ID는 필수입니다.'),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;

const integerString = coerce(integer(), string(), (value) => parseInt(value));

export const getInquiriesMyListStruct = object({  
  page: defaulted(min(integerString, 1), 1),
  pageSize: defaulted(min(integerString, 1), 10),
  status: optional(enums(["WaitingAnswer", "CompletedAnswer"])),
});
