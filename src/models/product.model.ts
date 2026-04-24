import {
  ProductWithRelations,
  ReviewSummary,
  StockDetail,
} from '../types/product.type';
import {
  calculateDiscountPrice,
  calculateReviewSummary,
  checkIsSoldOut,
  mapInquiriesWithSecret,
} from '../utils/product.util';
import { InquiryStatus } from '@prisma/client';

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
  inquiries: {
    id: string;
    title: string;
    content: string;
    status: InquiryStatus;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
    reply: {
      id: string;
      content: string;
      user: {
        id: string;
        name: string;
      } | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }[];
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
    this.discountStartTime = product.discountStartTime;
    this.discountEndTime = product.discountEndTime;
    this.discountPrice = calculateDiscountPrice(
      this.price,
      this.discountRate,
      this.discountStartTime,
      this.discountEndTime,
    );

    const { summary, reviewsCount, reviewsRating } = calculateReviewSummary(
      product.reviews,
    );
    this.reviews = summary;
    this.reviewsCount = reviewsCount;
    this.reviewsRating = reviewsRating;

    this.inquiries = mapInquiriesWithSecret(product.inquiries);

    this.categoryId = product.categoryId;
    this.category = {
      id: product.categoryId,
      name: product.category?.name || '',
    };

    this.stocks = product.stocks.map((stock) => ({
      id: stock.id,
      quantity: stock.quantity,
      size: {
        id: stock.size.id,
        name: stock.size.name,
      },
    }));

    this.isSoldOut = checkIsSoldOut(product.stocks);
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
    this.discountPrice = calculateDiscountPrice(
      this.price,
      this.discountRate,
      this.discountStartTime,
      this.discountEndTime,
    );
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    this.sales = product.sales || 0;
    this.categoryId = product.categoryId;

    const { reviewsCount, reviewsRating } = calculateReviewSummary(
      product.reviews,
    );
    this.reviewsCount = reviewsCount;
    this.reviewsRating = reviewsRating;

    this.isSoldOut = checkIsSoldOut(product.stocks);
  }
}
