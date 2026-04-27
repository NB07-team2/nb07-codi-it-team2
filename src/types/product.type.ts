import { Prisma } from '@prisma/client';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    store: true;
    category: true;
    stocks: {
      include: { size: true };
    };
    inquiries: {
      include: { reply: { include: { user: true } } };
    };
    reviews: true;
  };
}>;

export interface CreateProductRequest {
  name: string;
  price: number;
  content?: string;
  categoryName: string;
  stocks: { size: string; quantity: number }[];
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
}
// 리뷰 통계 데이터 전용 인터페이스 정의
export interface ReviewSummary {
  rate1Length: number;
  rate2Length: number;
  rate3Length: number;
  rate4Length: number;
  rate5Length: number;
  sumScore: number;
}

// 재고 상세 정보 인터페이스
export interface StockDetail {
  id: string;
  quantity: number;
  size: {
    id: number;
    name: string;
  };
}
