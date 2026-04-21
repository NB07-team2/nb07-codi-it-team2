export class ProductResponseDto {
  id: string;
  name: string;
  image: string | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewsRating: number;
  storeId: string;
  storeName: string;
  price: number;
  // 할인된 가격 계산 (할인율이 0이면 원래 가격과 동일)
  discountPrice: number;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  reviewsCount: number;
  // 리뷰 생성된 후 수정 예정
  reviews: any;
  // 문의 파악 후 수정 예정
  inquiries: any[];
  categoryId: string;
  category: { id: string; name: string };
  stocks: any[];
  isSoldOut: boolean;

  constructor(product: any) {
    this.id = product.id;
    this.name = product.name;
    this.image = product.image;
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

    // 새 상품이므로 리뷰 정보는 기본값 0
    this.reviewsRating = 0;
    this.reviewsCount = 0;
    this.reviews = {
      rate1Length: 0,
      rate2Length: 0,
      rate3Length: 0,
      rate4Length: 0,
      rate5Length: 0,
      sumScore: 0,
    };

    // 문의 정보도 기본값 빈 배열로 초기화 (추후 문의 데이터 매핑 예정)
    this.inquiries = product.inquiries || [];

    this.categoryId = product.categoryId;
    this.category = {
      id: product.categoryId,
      name: product.category?.name || '',
    };

    this.stocks = product.stocks
      ? product.stocks.map((stock: any) => ({
          id: stock.id,
          productId: stock.productId,
          quantity: stock.quantity,
          size: {
            id: stock.size.id,
            name: stock.size.name,
          },
        }))
      : [];

    // 모든 재고 수량이 0이면 true, 아니면 false
    this.isSoldOut =
      this.stocks.length > 0 && this.stocks.every((s) => s.quantity === 0);
  }
}
