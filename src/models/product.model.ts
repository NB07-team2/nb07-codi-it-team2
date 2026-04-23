import {
  ProductWithRelations,
  ReviewSummary,
  StockDetail,
} from '../types/product.type';

export class ProductResponseDto {
  id: string;
  name: string;
  image: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewsRating: number;
  storeId: string;
  storeName: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  reviewsCount: number;
  reviews: ReviewSummary;
  inquiries: ProductWithRelations['inquiries'];
  categoryId: string;
  category: { id: string; name: string };
  stocks: StockDetail[];
  isSoldOut: boolean;

  constructor(product: ProductWithRelations) {
    this.id = product.id;
    this.name = product.name;
    this.image = product.image || '';
    this.content = product.content;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    this.storeId = product.storeId;
    this.storeName = product.store?.name || '';
    this.price = product.price;
    this.discountRate = product.discountRate || 0;
    this.discountPrice = Math.floor(
      product.price * (1 - this.discountRate / 100),
    );
    this.discountStartTime = product.discountStartTime;
    this.discountEndTime = product.discountEndTime;

    // 리뷰 통계 초기화
    this.reviewsCount = product.reviews.length;
    this.reviewsRating =
      this.reviewsCount > 0
        ? Number(
            (
              product.reviews.reduce((acc, cur) => acc + cur.rating, 0) /
              this.reviewsCount
            ).toFixed(1),
          )
        : 0;
    // 단순히 0으로 초기화하는 대신 실제 데이터를 카운트
    this.reviews = {
      rate1Length: product.reviews.filter((r) => r.rating === 1).length,
      rate2Length: product.reviews.filter((r) => r.rating === 2).length,
      rate3Length: product.reviews.filter((r) => r.rating === 3).length,
      rate4Length: product.reviews.filter((r) => r.rating === 4).length,
      rate5Length: product.reviews.filter((r) => r.rating === 5).length,
      sumScore: product.reviews.reduce((acc, cur) => acc + cur.rating, 0),
    };

    // 문의 정보 매핑 - 문의 정보와 확인 필요
    this.inquiries = product.inquiries;
    this.categoryId = product.categoryId;
    this.category = {
      id: product.categoryId,
      name: product.category?.name || '',
    };

    this.stocks = product.stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
      size: {
        id: stock.size.id,
        name: stock.size.name,
      },
    }));

    // 모든 재고 수량이 0이면 true, 아니면 false
    this.isSoldOut =
      this.stocks.length > 0 && this.stocks.every((s) => s.quantity === 0);
  }
}

export class ProductListResponseDto {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  reviewsCount: number;
  reviewsRating: number;
  createdAt: Date;
  updatedAt: Date;
  sales: number;
  isSoldOut: boolean;
  categoryId: string;

  constructor(product: ProductWithRelations) {
    this.id = product.id;
    this.storeId = product.storeId;
    this.storeName = product.store?.name || '';
    this.name = product.name;
    this.image = product.image || '';
    this.price = product.price;
    this.discountRate = product.discountRate || 0;
    this.discountStartTime = product.discountStartTime;
    this.discountEndTime = product.discountEndTime;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    this.sales = product.sales || 0;
    this.categoryId = product.categoryId;

    // 현재 시간이 시작/종료 기간 내에 있을 때만 할인가 적용
    const nowTime = Date.now();
    const startTime = this.discountStartTime
      ? new Date(this.discountStartTime).getTime()
      : 0;
    const endTime = this.discountEndTime
      ? new Date(this.discountEndTime).getTime()
      : 0;

    const isDiscountActive =
      startTime > 0 &&
      endTime > 0 &&
      nowTime >= startTime &&
      nowTime <= endTime;

    if (isDiscountActive && this.discountRate > 0) {
      this.discountPrice = Math.floor(
        this.price * (1 - this.discountRate / 100),
      );
    } else {
      this.discountPrice = this.price; // 기간 아니면 정가
    }

    // 리뷰 데이터 가공
    this.reviewsCount = product.reviews.length;
    this.reviewsRating =
      this.reviewsCount > 0
        ? Number(
            (
              product.reviews.reduce((acc, cur) => acc + cur.rating, 0) /
              this.reviewsCount
            ).toFixed(1),
          )
        : 0;

    // 품절 여부: 모든 사이즈 재고 합이 0이면 true
    const totalQuantity = product.stocks.reduce(
      (acc, cur) => acc + cur.quantity,
      0,
    );
    this.isSoldOut = totalQuantity === 0;
  }
}
