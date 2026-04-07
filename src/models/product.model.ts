// 상품 등록 응답 DTO
export type CreateProductData = {
  id: string;
  name: string;
  image: string | null;
  content: string | null;
  price: number;
  isSoldOut: boolean;
  storeId: string;
  categoryId: string;
  discountRate: number | null;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  store: { id: string; name: string };
  category: { id: string; name: string };
  stocks: Array<{
    id: string;
    productId: string;
    quantity: number;
    size: { id: number; name: string };
  }>;
  inquiries: Array<{
    id: string;
    title: string;
    content: string;
    status: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
    reply: null | {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      user: { id: string; name: string };
    };
  }>;
};

export class CreateProductResponseDto {
  id: string;
  name: string;
  image: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  reviewsRating: number;
  storeId: string;
  storeName: string;
  price: number;
  discountPrice: number | null;
  discountRate: number | null;
  discountStartTime: string | null;
  discountEndTime: string | null;
  reviewsCount: number;
  reviews: {
    rate1Length: number;
    rate2Length: number;
    rate3Length: number;
    rate4Length: number;
    rate5Length: number;
    sumScore: number;
  };
  inquiries: Array<{
    id: string;
    title: string;
    content: string;
    status: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
    reply: null | {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      user: { id: string; name: string };
    };
  }>;
  categoryId: string;
  category: { name: string; id: string };
  stocks: Array<{
    id: string;
    productId: string;
    quantity: number;
    size: { id: number; name: string };
  }>;
  isSoldOut: boolean;

  constructor(data: CreateProductData) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? '';
    this.content = data.content ?? '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.reviewsRating = 0;
    this.storeId = data.storeId;
    this.storeName = data.store.name;
    this.price = data.price;
    this.discountRate = data.discountRate ?? null;
    this.discountPrice =
      data.discountRate != null
        ? Math.round(data.price * (1 - data.discountRate / 100))
        : null;
    this.discountStartTime = data.discountStartTime?.toISOString() ?? null;
    this.discountEndTime = data.discountEndTime?.toISOString() ?? null;
    this.reviewsCount = 0;
    this.reviews = {
      rate1Length: 0,
      rate2Length: 0,
      rate3Length: 0,
      rate4Length: 0,
      rate5Length: 0,
      sumScore: 0,
    };
    this.inquiries = data.inquiries.map((inq) => ({
      id: inq.id,
      title: inq.title,
      content: inq.content,
      status: inq.status,
      isSecret: inq.isSecret,
      createdAt: inq.createdAt,
      updatedAt: inq.updatedAt,
      reply: inq.reply
        ? {
            id: inq.reply.id,
            content: inq.reply.content,
            createdAt: inq.reply.createdAt,
            updatedAt: inq.reply.updatedAt,
            user: inq.reply.user,
          }
        : null,
    }));
    this.categoryId = data.categoryId;
    this.category = { name: data.category.name, id: data.category.id };
    this.stocks = data.stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
      size: stock.size,
    }));
    this.isSoldOut = data.isSoldOut;
  }
}
