import { ProductWithRelations, ReviewSummary } from '../types/product.type';

// 상품 할인 기간 유효성 체크 및 가격 계산
export const calculateDiscountPrice = (
  price: number,
  discountRate: number | null,
  startTime: Date | null,
  endTime: Date | null,
): number => {
  const now = Date.now();
  const start = startTime ? new Date(startTime).getTime() : 0;
  const end = endTime ? new Date(endTime).getTime() : 0;

  const isDiscountActive = start > 0 && end > 0 && now >= start && now <= end;

  if (isDiscountActive && discountRate && discountRate > 0) {
    return Math.floor(price * (1 - discountRate / 100));
  }

  return price;
};

// 상품 리뷰 통계 계산 공통화
export const calculateReviewSummary = (
  reviews: ProductWithRelations['reviews'],
) => {
  const reviewsCount = reviews.length;
  const summary: ReviewSummary = {
    rate1Length: 0,
    rate2Length: 0,
    rate3Length: 0,
    rate4Length: 0,
    rate5Length: 0,
    sumScore: 0,
  };

  reviews.forEach((r) => {
    const ratingKey = `rate${r.rating}Length` as keyof ReviewSummary;
    if (ratingKey in summary) {
      (summary[ratingKey] as number)++;
      summary.sumScore += r.rating;
    }
  });

  const reviewsRating =
    reviewsCount > 0 ? Number((summary.sumScore / reviewsCount).toFixed(1)) : 0;

  return { summary, reviewsCount, reviewsRating };
};

// 상품 품절 여부 체크
export const checkIsSoldOut = (stocks: ProductWithRelations['stocks']) => {
  const totalQuantity = stocks.reduce((acc, cur) => acc + cur.quantity, 0);
  return totalQuantity === 0;
};

// 상품 문의 내역 비밀글 매핑
export const mapInquiriesWithSecret = (
  inquiries: ProductWithRelations['inquiries'],
) => {
  return inquiries.map((iq) => {
    const isSecret = iq.isSecret;
    return {
      ...iq,
      content: isSecret ? '비밀글입니다.' : iq.content,
      reply: iq.reply
        ? {
            ...iq.reply,
            content: isSecret ? '비밀글입니다.' : iq.reply.content,
          }
        : null,
    };
  });
};
