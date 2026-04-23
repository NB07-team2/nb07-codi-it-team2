import { Infer } from "superstruct";
import { getOrdersMyListStruct } from "../structs/order.struct";

export interface CreateOrderRepoDto {
    name: string;
    phone: string;
    address: string;
    orderItems: {
        productId: string;
        sizeId: number;
        quantity: number;
        name?: string; // 상품 이름 추가 (선택적)
    }[];
    usePoint?: number;
}

export interface OrderCreateItem {
    id: string;
    name: string;
    phone: string;
    address: string;
    subtotal: number;
    totalQuantity: number;
    usePoint: number;
    createdAt: Date;
    orderItems: {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        product: {
            name: string;
            image: string | null;
            reviews?: {
                id: string;
                rating: number;
                content: string;
                createdAt: Date;
            }[];
        };
        size: {
            id: number;
            enName: string | null;
            koName: string | null;
        };
        isReviewed: boolean;
    }[];
    payments: {
        id: string;
        price: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
    } | null;
}

export type PaginationMyListParams = Infer<typeof getOrdersMyListStruct>;
export type OrderStatus = 'WaitingPayment' | 'CompletedPayment';    

export type OrderMyPagingRepoParams = PaginationMyListParams;

export interface OrderMyListItem {
    id: string;
    name: string;
    phone: string;
    address: string;
    subtotal: number;
    totalQuantity: number;
    usePoint: number;
    createdAt: Date;
    orderItems: {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        product: {
            name: string;
            image: string | null;
            reviews?: {
                id: string;
                rating: number;
                content: string;
                createdAt: Date;
            }[];
        };
        size: {
            id: number;
            enName: string | null;
            koName: string | null;
        };
        isReviewed: boolean;
    }[];
    payments: {
        id: string;
        price: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
    } | null;
}
