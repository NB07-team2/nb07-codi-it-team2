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

export const orderCreateSchema = z.object({
  name: z.string().min(1, '주문자 이름은 필수입니다.').max(50, '주문자 이름은 최대 50자까지 입력 가능합니다.'),
  phone: z.string().min(1, '전화번호는 필수입니다.').max(20, '전화번호는 최대 20자까지 입력 가능합니다.'),
  address: z.string().min(1, '배송 주소는 필수입니다.').max(200, '배송 주소는 최대 200자까지 입력 가능합니다.'),
  orderItems: z.array(z.object({
    productId: z.string().min(1, '상품 ID는 필수입니다.'),
    sizeId: z.number().min(1, '사이즈 ID는 필수입니다.'),
    quantity: z.number().min(1, '수량은 1 이상이어야 합니다.'),
  })).min(1, '주문 항목은 최소 1개 이상이어야 합니다.'),
  usePoint: z.number().min(0, '사용 포인트는 0 이상이어야 합니다.').optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

const integerString = coerce(integer(), string(), (value) => parseInt(value));

export const getOrdersMyListStruct = object({  
  page: defaulted(min(integerString, 1), 1),
  pageSize: defaulted(min(integerString, 1), 10),
  status: optional(enums(["WaitingPayment", "CompletedPayment"])),
});