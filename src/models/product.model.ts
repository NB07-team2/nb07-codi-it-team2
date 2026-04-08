import { InquiryStatus } from "@prisma/client";

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
  // Product basic information
  id: string;
  name: string;
  image: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  // Review-related information
  reviewsRating: number;
  reviewsCount: number;
  reviews: {
    rate1Length: number;
    rate2Length: number;
    rate3Length: number;
    rate4Length: number;
    rate5Length: number;
    sumScore: number;
  };

  // Category-related information
  categoryId: string;
  category: { name: string; id: string };

  // Stock-related information
  stocks: Array<{
    id: string;
    productId: string;
    quantity: number;
    size: { id: number; name: string };
  }>;

  //inquiry-related information
  inquiry: Array<{
    id: string;
    title: string;
    content: string;
    status: InquiryStatus;
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

  // Store-related information
  storeId: string;
  storeName: string;

  // Discount-related information
  price: number;
  discountPrice: number | null;
  discountRate: number | null;
  discountStartTime: string | null;
  discountEndTime: string | null;

  // Product status
  isSoldOut: boolean;

  constructor(data: CreateProductData) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? '';
    this.content = data.content ?? '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.inquiry = data.inquiries?.map((inquiry) => ({
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      status: inquiry.status as InquiryStatus,
      isSecret: inquiry.isSecret,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      reply: inquiry.reply
        ? {
            id: inquiry.reply.id,
            content: inquiry.reply.content,
            createdAt: inquiry.reply.createdAt,
            updatedAt: inquiry.reply.updatedAt,
            user: { id: inquiry.reply.user.id, name: inquiry.reply.user.name },
          }
        : null,
    })) ?? [];
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
    this.categoryId = data.categoryId;
    this.category = { name: data.category.name, id: data.category.id };
    this.stocks = data.stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
      size: stock.size,
    }));
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
    this.isSoldOut = data.isSoldOut;
  }
}
