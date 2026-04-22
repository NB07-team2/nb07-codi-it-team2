import { number, object, optional, pattern, size, string } from 'superstruct';

//상품 아이디 파라미터
export const ProductIdStruct = object({
  productId: string(),
});

export const CreateReviewStruct = object({
  rating: size(number(), 1, 5),
  content: size(string(), 10, 1000),
  orderItemId: string(),
});

//상품 리뷰 목록 조회 쿼리 파라미터
export const GetReviewsQueryStruct = object({
  page: optional(pattern(string(), /^[1-9]+$/)),
  limit: optional(pattern(string(), /^[1-9]+$/)),
});

//리뷰 아이디 파라미터
export const ReviewIdParamStruct = object({
  reviewId: string(),
});
