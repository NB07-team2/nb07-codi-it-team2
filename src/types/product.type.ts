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
