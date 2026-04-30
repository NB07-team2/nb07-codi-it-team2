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
  pageSize: defaulted(min(integerString, 1), 16),
  status: optional(enums(["WaitingAnswer", "CompletedAnswer"])),
});



export const getInquiriesProductListStruct = object({  
  page: defaulted(min(integerString, 1), 1),
  pageSize: defaulted(min(integerString, 1), 10),
  status: optional(enums(["WaitingAnswer", "CompletedAnswer"])),
  sort : optional(enums(["recent", "oldest"])),
});

export const inquiryUpdateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(20, '제목은 최대 20자까지 입력 가능합니다.').optional(),
  content: z.string().min(1, '내용은 필수입니다.').max(1000, '내용은 최대 1000자까지 입력 가능합니다.').optional(),
  isSecret: z.boolean().default(false).optional(),
});

export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

export const inquiryIdSchema = z.object({
  id: z.string().min(1, '올바른 문의 ID 형식이 아닙니다.'),
});

export const replyCreateSchema = z.object({
  content: z.string().min(1, '내용은 필수입니다.').max(1000, '내용은 최대 1000자까지 입력 가능합니다.'),
  inquiryId: z.string().min(1, '문의 ID는 필수입니다.')
});

export type ReplyCreateInput = z.infer<typeof replyCreateSchema>;

export const replyIdSchema = z.object({
  id: z.string().min(1, '올바른 답변 ID 형식이 아닙니다.'),
});

export const replyUpdateSchema = z.object({
  content: z.string().min(1, '내용은 필수입니다.').max(1000, '내용은 최대 1000자까지 입력 가능합니다.'),
});

export type ReplyUpdateInput = z.infer<typeof replyUpdateSchema>;