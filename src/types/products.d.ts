export type CreateProductStockInput = { sizeId: number; quantity: number };

export type  createProductRepoInput = {
    name: string;
    image?: string | null;
    content?: string | null;
    price: number;

    discountRate?: number | null;
    discountStartTime?: Date | null;
    discountEndTime?: Date | null;

    storeId : string;
    categoryId: string;
    
    stocks?: CreateProductStockInput[];
}

export type createProductRequest = {
    name: string;
    price: number;
    content?: string;
    image?: string;

    categoryName: string;

    stocks: Array<{
    sizeId: number;
    quantity: number;
    }>;

    discountRate?: number;
    discountStartTime?: string;
    discountEndTime?: string;
}

export type ReviewSummary = {
  rate1Length: number;
  rate2Length: number;
  rate3Length: number;
  rate4Length: number;
  rate5Length: number;
  sumScore: number;
};

export type ProductDetailResponse = {
  id: string;
  name: string;
  image?: string | null;
  content?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewsRating: number; // average
  storeId: string;
  storeName: string;
  price: number;
  discountPrice?: number | null;
  discountRate?: number | null;
  discountStartTime?: string | null;
  discountEndTime?: string | null;
  reviewsCount: number;
  reviews: ReviewSummary;
  inquiries: Array<any>; // 문의 사항은 상세 구현 후 타입 정의
  categoryId: string;
  category: { name: string; id: string };
  stocks: Array<{
    id: string;
    productId: string;
    quantity: number;
    size: { id: number; name: string };
  }>;
  isSoldOut: boolean;
};