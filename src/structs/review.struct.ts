import { number, object, size, string } from 'superstruct';

//상품 아이디 파라미터
export const ProductIdStruct = object({
  productId: string(),
});

export const CreateReviewStruct = object({
  rating: size(number(), 1, 5),
  content: size(string(), 1, 1000),
  orderItemId: string(),
});
