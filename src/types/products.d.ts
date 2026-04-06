export type CreateProductStockInput = { sizeId: number; quantity: number };

export type  createProductInput = {
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