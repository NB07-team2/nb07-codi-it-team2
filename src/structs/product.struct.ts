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

//  productId 파라미터 검증 스키마
export const productIdParamSchema = z.object({
  productId: z.string().cuid('유효하지 않은 상품 ID 형식입니다.'),
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
    image: z.any().optional(),
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
export const getProductsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(16),
  search: z.string().optional(),
  sort: z
    .enum([
      'mostReviewed',
      'recent',
      'lowPrice',
      'highPrice',
      'highRating',
      'salesRanking',
    ])
    .default('recent'),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  favoriteStore: z.string().optional(),
  categoryName: z.string().optional(),
});

export type GetProductsQuery = z.infer<typeof getProductsQuery>;
export type CreateProductDTO = z.infer<typeof createProductbody>;
