
import { z } from 'zod';

export const stockItem = z.object({
    sizeId: z.number().int().positive(),
    quantity: z.number().int().min(0),
})

const isoDateString = z.string().refine(
      (v: string) => !Number.isNaN(Date.parse(v)),
  { message: "유효한 ISO 날짜 문자열이 아닙니다." }
);

export const createProductbody = z.object({
    name: z.string().min(1, '상품 이름을 입력해주세요.').max(50, '상품 이름은 최대 50자까지 입력 가능합니다.'),
    price: z.number().int().min(0),
    content: z.string().min(1,'상품 설명을 입력해주세요.').max(1000, '상품 설명은 최대 1000자까지 입력 가능합니다.'),
    image: z.any(),
    categoryName: z.union([
        z.literal("all"),
        z.literal("top"),
        z.literal("bottom"),
        z.literal("dress"), 
        z.literal("outer"),
        z.literal("skirt"),
        z.literal("shoes"),
        z.literal("acc")
    ]),
    stocks: z.array(stockItem).min(1),
    discountRate: z.number().int().min(1).max(100).optional(),
    discountStartTime: isoDateString.optional(),
    discountEndTime: isoDateString.optional(),
})

  .superRefine((data, ctx) => {
    const hasRate = data.discountRate !== undefined;
    const hasStart = data.discountStartTime !== undefined;
    const hasEnd = data.discountEndTime !== undefined;

    if (hasRate || hasStart || hasEnd) {
      if (!hasRate || !hasStart || !hasEnd) {
        ctx.addIssue({
          code: "custom",
          message: "할인 정보를 모두 입력하거나 모두 생략해야 합니다.",
          path: ["discountRate"],
        });
      } else {
        const start = new Date(data.discountStartTime!);
        const end = new Date(data.discountEndTime!);
        if (!(start < end)) {
          ctx.addIssue({
            code: "custom",
            message: "할인 시작 시간은 할인 종료 시간보다 이전이어야 합니다.",
            path: ["discountStartTime"],
          });
        }
      }
    }
  })

  .transform((data) => ({
    ...data,
    content: data.content ?? null,
    image: data.image ?? null,
    discountRate: data.discountRate ?? null,
    discountStartTime: data.discountStartTime ?? null,
    discountEndTime: data.discountEndTime ?? null,
  }));

export type CreateProductDTO = z.infer<typeof createProductbody>;
