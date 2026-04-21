export interface CreateProductRequest {
  name: string;
  price: number;
  content?: string;
  categoryName: string;
  stocks: { size: string; quantity: number }[]; // 사이즈 이름과 수량
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
}
