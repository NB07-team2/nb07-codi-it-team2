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

    // 리뷰 통계 초기화 (타입 안전성 확보)
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

    // 문의 정보 매핑 (ProductWithRelations 타입을 그대로 활용) - 문의 정보와 확인 필요
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
