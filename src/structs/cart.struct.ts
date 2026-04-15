import { z } from 'zod';

export const updateCartSchema = z.object({
  productId: z.string({ message: "유효한 productId가 필요합니다." })
    .min(1, "상품 ID는 필수입니다."),
  
  sizes: z.array(
    z.object({
      sizeId: z.number({ message: "사이즈 ID는 숫자여야 합니다." }),
      
      quantity: z.number({ message: "수량은 숫자여야 합니다." })
        .min(1, "수량은 1개 이상이어야 합니다.")
    })
  ).min(1, "수정할 사이즈 정보가 최소 하나 이상 필요합니다.")
});

export type UpdateCartInput = z.infer<typeof updateCartSchema>;