import { z } from 'zod';

export const stockItem = z.object({
  sizeId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0),
});

const isoDateString = z
  .string()
  .refine((v: string) => !Number.isNaN(Date.parse(v)), {
    message: '유효한 ISO 날짜 문자열이 아닙니다.',
  });

export const createProductbody = z
  .object({
    name: z
      .string()
      .min(1, '상품 이름을 입력해주세요.')
      .max(50, '상품 이름은 최대 50자까지 입력 가능합니다.'),
    price: z.coerce.number().int().min(0),
    content: z
      .string()
      .min(1, '상품 설명을 입력해주세요.')
      .max(1000, '상품 설명은 최대 1000자까지 입력 가능합니다.'),
    image: z.any().optional(), // image는 multer가 처리하므로 optional로 두는게 안전합니다
    categoryName: z.enum([
      'all',
      'top',
      'bottom',
      'dress',
      'outer',
      'skirt',
      'shoes',
      'acc',
    ]),
    stocks: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z.array(stockItem).min(1, '최소 하나 이상의 재고를 입력해야 합니다.'),
    ),
    discountRate: z.coerce.number().int().min(1).max(100).optional(),
    discountStartTime: isoDateString.optional(),
    discountEndTime: isoDateString.optional(),
  })
  .superRefine((data, ctx) => {
    const { discountRate, discountStartTime, discountEndTime } = data;
    const hasAnyDiscount =
      discountRate !== undefined ||
      discountStartTime !== undefined ||
      discountEndTime !== undefined;

    if (hasAnyDiscount) {
      if (
        discountRate === undefined ||
        discountStartTime === undefined ||
        discountEndTime === undefined
      ) {
        ctx.addIssue({
          code: 'custom',
          message: '할인 정보를 모두 입력하거나 모두 생략해야 합니다.',
          path: ['discountRate'],
        });
      } else {
        const start = new Date(discountStartTime);
        const end = new Date(discountEndTime);
        if (start >= end) {
          ctx.addIssue({
            code: 'custom',
            message: '할인 시작 시간은 할인 종료 시간보다 이전이어야 합니다.',
            path: ['discountStartTime'],
          });
        }
      }
    }
  });

// transform은 서비스 로직 안에서 필요한 경우에만 처리하는 것이 타입 추론에 더 유리합니다.
export type CreateProductDTO = z.infer<typeof createProductbody>;
